module BMDash
    class DashboardDefError < BMDashError; end
    class Dashboard
        attr_reader :name, :desc, :author, :email, :screens, :widgets
        attr_writer :current_screen, :update_time, :events

        def initialize dashboard
            # Check and set basic attributes 
            %w(name desc author email).each do |attr|
                if dashboard.has_key? attr
                    instance_variable_set "@#{attr}", dashboard[attr]
                else
                    raise DashboardDefError, "#{attr} is not present in dashboard"
                end
            end
            # See if we have any screens and widgets defined
            @screens = []
            @widgets = []

            if dashboard.has_key? 'screens' 
                screen_count = 0
                dashboard['screens'].each do |screen|
                    hash = {}
                    hash['name'] = (screen.has_key? 'name') ? screen['name'] : "Screen #{screen_count}"
                    hash['timeout'] = (screen.has_key? 'timeout') ? screen['timeout'] : 300
                    hash['widgets'] = []
                    if screen.has_key? 'widgets'
                        screen['widgets'].each do |widget|
                            %w(name row col).each do |attr|
                                raise DashboardDefError, "Widgets #{attr} is missing" if ! widget.has_key? attr
                            end
                           @widgets << widget['name'] if ! @widgets.include?(widget['name'])
                           hash['widgets'] << widget
                        end 
                    else 
                        raise DashboardDefError, "#{screen['name']} has no widgets!"
                    end
                    screen_count = screen_count + 1
                    @screens << hash
                end
            else
                raise DashboardDefError, 'There are no screens defined!' 
            end
            @current_screen = @screens[0]
            @update_time = Time.now.to_i + @current_screen['timeout']
            @events = Queue.new
        end

        def update
           time_now = Time.now.to_i
           if time_now > @update_time
                rotate_screens
                @update_time = Time.now.to_i + @current_screen['timeout']
           end
        end

        def rotate_screens
            @screens.rotate!
            @current_screen = @screens.first
            BMDash.logger.debug "#{name} has rotated to screen '#{@current_screen['name']}'"
            BMDash.logger.debug "Next rotation in #{@current_screen['timeout']} seconds"
            # Send event
        end
    end
end
