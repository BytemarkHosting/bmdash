require 'sinatra'
require 'sprockets'
require 'sass'
require 'rufus-scheduler'
require 'pp'


module Bytemark
    class BMDash < Sinatra::Base

        configure do 
            # Setup defaults 
            set :root, Dir.pwd
            set :public_folder, File.join(settings.root, 'public')
            set :assets, Sprockets::Environment.new(settings.root)
            set :scheduler, Rufus::Scheduler.new 
            set :connections, []
            set :server, 'thin'
            # Enable sweet things
            enable :logging
            # Setup asset processing
            %w(javascripts stylesheets fonts images sounds).each do |path|
               settings.assets.append_path("./assets/#{path}")
            end
            manifest = Sprockets::Manifest.new(assets, './public/assets/manifest.json').save

            scheduler.every '5s' do 
               ping_clients
            end

        end

        def self.ping_clients 
            self.connections.each do |client|
                client.stream << "ping!"
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
            settings.connections << client
          end
        end

        get '/' do 
            'BMDash! is here'
        end
    end

    class ClientConnection
        attr_reader :name, :ip, :connected_at, :type, :stream
        def initialize info
            info.each do |key,value|
               instance_variable_set "@#{key}", value
            end
        end
    end
end
