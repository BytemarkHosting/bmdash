module BMDash 
    class ClientConnection
        attr_reader :name, :ip, :connected_at, :group, :stream
        attr_accessor :token
        def initialize info
            info.each do |key,value|
               instance_variable_set "@#{key}", value
            end
        end
   end
end
