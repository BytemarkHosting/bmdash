module BMDash
    class Event 
        
        def self.format event
          raise BMDash::BMDashError, "Event name is missing - #{event}" unless event.keys.include? :event 
          data = (JSON.generate event[:data] if event[:data]) || ""
          str = ""
          str << "id: #{event[:id]}\n" if event[:id]
          str << "event: #{event[:event]}\n" if event[:event]
          str << "data: #{data}\n"
          str << "\n"
        end

    end
end
