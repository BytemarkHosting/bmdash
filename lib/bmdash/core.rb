require 'sinatra'
require 'sprockets'
require 'sass'


module Bytemark
    class BMDash < Sinatra::Base
        

        configure do 
            # Setup defaults 
            set :root, Dir.pwd
            set :public_folder, File.join(settings.root, 'public')
            set :assets, Sprockets::Environment.new(settings.root)
            set :connections, []
            set :server, 'thin'
            # Enable sweet things
            enable :logging
            # Setup asset processing
            %w(javascripts stylesheets fonts images sounds).each do |path|
               settings.assets.append_path("./assets/#{path}")
            end
            manifest = Sprockets::Manifest.new(assets, './public/assets/manifest.json').save
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

        get '/' do 
            'BMDash! is here'
        end

    end
end
