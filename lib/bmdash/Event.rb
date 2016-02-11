module BMDash
    class Event 
        
        def self.format event
          raise BMDash::BMDashError, "Event name is missing - #{event}" unless event.keys.include? :name
          data = (JSON.generate event[:data] if event[:data]) || ""
          str = ""
          str << "id: #{event[:id]}\n" if event[:id]
          str << "event: #{event[:name]}\n" if event[:name]
          str << "data: #{data}\n"
          str << "\n"
        end

    end
end
