require 'sinatra'
require 'sprockets'
require 'sass'
require 'rufus-scheduler'
require 'filewatcher'
require 'yaml'
require 'pp'


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
            attr_reader :name, :author, :email, :about
            def initialize about
                about.each do |key,value|
                   instance_variable_set "@#{key}", value
                end
            end
        end

        def self.load_widgets
            Dir.foreach('widgets') do |dir|
                next if dir[0] == '.'
                widget_info = File.join Dir.pwd, 'widgets',  dir, 'about.yml'
                if File.exists? widget_info 
                   info = YAML::load_file widget_info
                   self.widgets[info['name']] = Widget.new(info)
                end
            end
            puts 'Available widgets:'
            self.widgets.each do |name, widget|
                puts "    - #{name}"
            end

        end

        def self.file_changed filename, event

        end

        def self.ping_clients 
            puts 'Currently Connected: '
            self.connections.each do |client|
                puts '    - ' + client.name
                client.stream << "ping!"
            end
        end

        configure do 
            # Enable sweet things
            enable :logging

            # Setup defaults 
            set :root, Dir.pwd
            set :public_folder, File.join(settings.root, 'public')
            set :assets, Sprockets::Environment.new(settings.root)
            set :scheduler, Rufus::Scheduler.new 
            set :watcher, FileWatcher.new(['./widgets', './dashboards'])
            set :watcher_thread, nil
            set :connections, []
            set :widgets, {}
            set :server, 'thin'
            set :logger, ENV['rack.logger'] # Setup asset processing
            %w(javascripts stylesheets fonts images sounds).each do |path|
               settings.assets.append_path("./assets/#{path}")
            end
            manifest = Sprockets::Manifest.new(assets, './public/assets/manifest.json').save

            # Load widgets from ./widgets
            load_widgets

            # Setup default events
            scheduler.every '5s' do 
               ping_clients
            end
            
            # Setup file watching
            watcher_thread = Thread.new(watcher) do |watcher|
                watcher.watch do |filename, event|
                    self.file_changed filename, event
                end
            end

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
             content_type asset.content_type
             asset
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
            
            out << "Hello!"
          end
        end

        get '/' do 
            'BMDash! is here'
        end
    end


end
