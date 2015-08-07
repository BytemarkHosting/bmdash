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
require_relative '../script/lib/script.rb'

module Bytemark
    class BMDash < Sinatra::Base

        class ClientConnection
            attr_reader :name, :ip, :connected_at, :type, :stream
            def initialize info
                info.each do |key,value|
                   instance_variable_set "@#{key}", value
                end
            end
        end

        class Widget 
            attr_reader :name, :author, :email, :about, :html
            def initialize about
                about.each do |key,value|
                   instance_variable_set "@#{key}", value
                end
            end

            def to_json options
                hash = {}
                instance_variables.each do |var|
                    key = var.to_s
                    key[0] = ''
                    hash[key] = instance_variable_get var
                end
                JSON.pretty_generate hash
            end
        end

        def self.load_widgets
            self.widgets = {}
            Dir.foreach('widgets') do |dir|
                next if dir[0] == '.'
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

        def self.ping_clients 
            self.logger.info 'Currently Connected: '
            self.connections.each do |client|
                self.logger.info '    - ' + client.name
                client.stream << "ping!"
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

        def self.send_event event
            self.connections.each do |client|
                client.stream << JSON.pretty_generate(event)
            end
        end

        configure do 

            # Deal with logging
            logger = Logger.new(STDOUT)

            set :logger, logger

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
            set :events, []
            set :scripts, {}
            set :widgets, {}
            asset_types.each do |path|
               settings.assets.append_path("./assets/#{path}")
            end
            manifest = Sprockets::Manifest.new(assets, './public/assets/manifest.json').save

            # Load widgets from ./widgets
            load_widgets

            # Setup default events
            scheduler.every '1s' do 
                send_script_events
            end
            scheduler.every '5s' do 
               ping_clients
            end

            # Setup file watching
            watcher_thread = Thread.new(watcher) do |watcher|
                watcher.watch do |filename, event|
                    self.file_changed filename, event
                end
            end

            # Run the setup methods in all the scripts 
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
                :stream => out
            }
            client = ClientConnection.new info
            client.stream.callback do 
                settings.connections.delete(client)
            end
            settings.connections << client
            logger.info "Client #{client.name} has connected!"
            
            out << "Hello!"
          end
        end

        get '/' do 
            settings.logger.info "Yeah!"
            'BMDash! is here'
        end
    end

end
