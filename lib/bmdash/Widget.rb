module BMDash 
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
end
