require 'sinatra'
require 'sinatra/json'
require 'sprockets'
require 'sass'
require 'rufus-scheduler'
require 'filewatcher'
require 'yaml'
require 'json'
require 'logger'
require 'pp'
require 'securerandom'
require_relative '../script/lib/script.rb'

module BMDash
    class App < Sinatra::Base

        NO_TOKEN = Event.format( {:event => 'no_token'} )

        def self.load_dashboards
            self.logger.info 'Loading Dashboards:'
            Dir.foreach('dashboards') do |dir|
                next if dir[0] == '.'
                next unless dir.match /\.yml$/
                self.logger.info "    - Trying #{dir}"
                dashboard_path = File.join Dir.pwd, 'dashboards', dir
                dashboard = YAML::load_file dashboard_path 
                begin 
                    settings.dashboards << Dashboard.new(dashboard)
                rescue DashboardDefError => e
                    self.logger.error "#{dashboard_path} - #{e.message}" 
                    self.logger.error 'Skipping...'
                end
            end

            self.logger.info 'Available Dashboards:'
            self.settings.dashboards.each do |dash|
                self.logger.info "    - #{dash.name}"
            end
        end

        def self.update_dashboards
            self.dashboards.each do |dash|
                dash.update
            end
        end

        def self.load_widgets
            self.logger.info 'Loading Widgets:'
            Dir.foreach('widgets') do |dir|
                next if dir[0] == '.'
                self.logger.info "    - Trying #{dir}"
                widget_dir = File.join Dir.pwd, 'widgets',  dir
                
                begin
                    # Attempt to create widget
                    widget_info = YAML::load_file(File.join widget_dir, 'about.yml')
                    widget_info['path'] = widget_dir
                    widgets[widget_info['name']] = Widget.new(widget_info)
                    # Add it's assets to Sprockets
                    asset_paths = []
                    widgets[widget_info['name']].assets.each do |asset|
                       asset_type = asset.split('/')[-2]
                       asset_paths << "#{widget_dir}/#{asset_type}" if ! asset_paths.include? asset_type 
                    end
                    asset_paths.each do |asset_path|
                        self.assets.append_path asset_path
                    end
                rescue BMDashError => e
                    self.logger.error "Failed to load widget from #{widget_dir} - #{e.message}" 
                end

            end

            self.logger.info 'Available widgets:'
            self.widgets.each do |name, widget|
                self.logger.info "    - #{name}"
            end
        end


        def self.file_changed filename, event

        end

        def self.welcome_clients 
            self.connections.each do |token, client|
                if client.token == nil
                   client.token = SecureRandom.uuid
                   send_event 'welcome', ({
                        :id => Time.now,
                        :event => "client_connection",
                        :data => {
                            :msg => "Welcome #{client.name}",
                            :token => client.token
                        }
                    })
                    self.logger.info "Welcomed #{client.name} with #{client.token}"
                end
            end
        end

        def self.ping_clients 
            self.logger.debug 'Currently Connected: '
            self.connections.each do |token, client|
                self.logger.debug "   - #{client.name}"
                send_event 'ping', { :data => { :time => DateTime.now }}
            end
        end

        def self.setup_widgets
            self.scripts.each do |name, script|
                begin
                    script.setup
                rescue NoMethodError
                    self.logger.warn "#{name} has no run method!"
                end
            end
        end

        def self.send_script_events
            self.widgets.each do |name, widget|
                while ! widget.script.events.empty?
                    self.send_event 'widget_update', widget.script.events.pop
                end
            end
        end

        def self.send_dashboard_events
            self.dashboards.each do |dash|
                while ! dash.events.empty?
                    self.send_event dash.events.pop
                end
            end
        end

        def self.send_event event_name, event
            begin
                event[:event] = event_name
                event = Event.format event
                self.connections.each do |token, client|
                    if client.token
                        client.stream << event
                    else
                        client.stream << NO_TOKEN
                    end
                end
            rescue BMDashError => e
                self.logger.error "Duff event sent! #{e.message}" 
            end
        end

        configure do 

            set :logger, BMDash.logger

            # Setup defaults 
            set :server, 'thin'
            set :root, Dir.pwd
            set :public_folder, File.join(settings.root, 'public')
            set :assets, Sprockets::Environment.new(settings.root)
            set :asset_types, %w(javascripts stylesheets fonts images sounds)
            set :scheduler, Rufus::Scheduler.new 
            set :watcher, FileWatcher.new(['./widgets', './dashboards'])
            set :watcher_thread, nil
            set :connections, {}
            set :dashboards, []
            set :events, []
            set :scripts, {}
            set :widgets, {}
            
            # Configure sprockets to handle our default assets
            asset_types.each do |path|
               settings.assets.append_path("./assets/#{path}")
            end
            manifest = Sprockets::Manifest.new(assets, './public/assets/manifest.json').save

            # Load widgets from ./widgets
            load_widgets
            # Load widgets from ./dashboards
            load_dashboards

            # Setup default events
            scheduler.every '1s' do 
                welcome_clients
            end

            scheduler.every '1s' do 
                update_dashboards
            end

            scheduler.every '1s' do
                send_dashboard_events
                send_script_events
            end

            scheduler.every '10s' do 
               ping_clients
            end

            scheduler.every '30s' do
            end

            # Setup file watching
            watcher_thread = Thread.new(watcher) do |watcher|
                watcher.watch do |filename, event|
                    self.file_changed filename, event
                end
            end

            # Run the setup methods in all the scripts 
            self.logger.info "Running Widget setup:"
            setup_widgets

        end


        configure :development do 
            enable :debug
        end

        configure :production do 
            settings.assets.css_compressor = :scss
            settings.assets.js_compressor = :uglify
        end

        before do 
            # Check the token is valid, unless this is a request for root
#            unless ( 
#                    request.env['REQUEST_URI'] == '/' || 
#                    request.env['REQUEST_URI'].match(/assets\/?*/) )
#                halt 403 unless params.has_key?('token') 
#                halt 403 unless settings.connections.has_key?(params['token'])
#            end
        end

        helpers do 
            
            def new_token 
                begin
                    token = SecureRandom.uuid 
                end while settings.connections.has_key? token
                token
            end

            def remove_client client
                settings.logger.info "Client #{client.name} disconnected"
                settings.connections.delete(client.token)
            end

            def  check_token token
                return  settings.connections.has_key? token
            end 

            def new_client name, type, ip, stream
                client = ClientConnection.new({
                    :name => name,
                    :type => type,
                    :ip =>ip,
                    :connected_at => DateTime.now,
                    :token => new_token,
                    :stream => stream
                })
                client.stream.callback do 
                    remove_client client    
                end
                settings.connections[client.token] =  client
                client
            end

        end

        get '/assets/:asset' do 
             asset =  settings.assets.find_asset(params[:asset])
             if asset 
                 content_type asset.content_type
                 asset
             else
                404
             end
        end 

        get '/widgets' do 
                json settings.widgets
        end

        get '/events', provides: 'text/event-stream' do
          return 403 if params[:name].nil? || params[:type].nil?
          stream :keep_open do |out|
            client = new_client params[:name], params[:type], request.ip, out 
            logger.info "Client #{client.name} has connected!"
          end
        end

        get '/dashboards/?', provides: 'application/json' do 
            hash = {}
            hash['dashboards'] = []
            settings.dashboards.each do |dash|
               hash['dashboards']  << dash
            end
           JSON.pretty_generate hash 
        end

        get '/widgets/?', provides: 'application/json' do 
            hash = {}
            hash['widgets'] = []
            settings.widgets.each do |widget|
               hash['widgets']  << widget
            end
           JSON.pretty_generate hash 
            
        end

        get '/' do 
            # Assume any logic to bless clients goes here
            # We don't have any like that atm though so just return a valid
            # token 
            @token = new_token
            erb :index
        end

    end
end
