require 'rufus-scheduler'

module BMDash 

    class Widget 
        attr_reader :name, :author, :email, :about, 
                    :html, :script, :assets

        def initialize info
            # Set basic Widget Details
            %w(name author email about).each do |attr|
                if info.has_key? attr
                    instance_variable_set("@#{attr}", info[attr]) 
                else
                    instance_variable_set("@#{attr}", "N/A") 
                end
            end
            
            # Check the HTML exists
            html_path = File.join info['path'], "#{info['name']}.html"
            html_path.downcase
            # At least a HTML file is reuiqred here
            if ! File.exists? html_path
                raise BMDashError, "Widget HTML file #{html_path} does not exist!"
            end
            @html = "widgets/#{info['name']}.html"

            # Load the script if there is on
            script_path = File.join info['path'], "#{info['name']}.rb"
            script_path.downcase!
            if File.exists? script_path
                @script = Script.load(script_path) do |script|
                    script.__send__(:attr_accessor, 'scheduler', 'logger', 'events');
                    script.__send__('scheduler=', Rufus::Scheduler.new)
                    script.__send__('logger=', BMDash.logger)
                    script.__send__('events=', Queue.new)
                end
            else 
                @script = nil
            end

            # Get a list of assets to load
            assets=[]
            %w(javascripts stylesheets images fonts sounds).each do |dir|
                asset_dir = File.join(info['path'], dir)
                if Dir.exists?(asset_dir)
                    Dir.foreach(asset_dir) do |file| 
                        next if file[0] == '.'
                        assets << File.join(info['path'], dir, file)
                    end
                end
            end
            @assets = assets
        end

        def has_job?
            (@script) ? true : false
        end

        def to_json settings
            hash = {}
            instance_variables.each do |var|
                key = var.to_s
                key[0] = ''
                next if key == 'script'
                hash[key] = instance_variable_get var
            end
            JSON.pretty_generate hash
        end

    end

end
