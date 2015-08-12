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
                widget_info = File.join widget_dir, 'about.yml'

                info = YAML::load_file widget_info

                widget_html = File.join widget_dir, "#{info['name']}.html"
                widget_job = File.join widget_dir, "#{info['name']}.rb"

                # Check that about.yml exists, skip if not
                if ! File.exists? widget_html 
                    self.logger.warn "Widget #{info['name']} has no about.yml, skipping..."
                    next
                end
                # Check that the html file exists, skip if not
                if ! File.exists? widget_info 
                    self.logger.warn "Widget #{info['name']} does not have a #{info['name']}.html file, skipping..."
                    next
                end

                info['url'] = "widgets/#{info['name']}.html"

                if File.exists? widget_job
                    info['job'] = true
                    self.scripts[info['name']] = Script.load(widget_job) do |script|
                        script.__send__(:attr_accessor, 'scheduler', 'logger', 'events');
                        script.__send__('scheduler=', self.scheduler)
                        script.__send__('logger=', self.logger)
                        script.__send__('events=', [])
                    end
                else
                    info['job'] = false
                end
                
                self.widgets[info['name']] = Widget.new(info)
                self.asset_types.each do |asset_dir|
                   asset_path = File.join widget_dir, asset_dir
                   if Dir.exists? asset_path
                       self.settings.assets.append_path(asset_path)
                   end
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
            self.connections.each do |client|
                if client.token == nil
                   client.token = SecureRandom.uuid
                   send_event ({
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
            self.connections.each do |client|
                self.logger.debug "   - #{client.name}"
                send_event ({
                    :event => 'ping'
                })
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
            self.scripts.each do |name, script|
                script.events.each do |event|
                    self.send_event event
                end
                script.events.clear
            end
        end

        def self.send_dashboard_events
            self.dashboards.each do |dash|
                while ! dash.events.empty?
                    self.send_event dash.events.pop
                end
            end
        end

        def self.send_event event
            begin
                event = Event.format event
                self.connections.each do |client|
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
            set :connections, []
            set :dashboards, []
            set :events, []
            set :scripts, {}
            set :widgets, {}
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
            info = {
                :name => params[:name],
                :type => params[:type],
                :ip => request.ip,
                :connected_at => DateTime.now,
                :token => nil,
                :stream => out
            }
            client = ClientConnection.new info
            client.stream.callback do 
                settings.connections.delete(client)
            end
            settings.connections << client
            logger.info "Client #{client.name} has connected!"

          end
        end

        get '/' do 
            settings.logger.info "Yeah!"
            'BMDash! is here'
        end
    end

end
