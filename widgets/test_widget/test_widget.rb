require 'securerandom'  

def setup 
    @logger.info 'Test Widget - Doomsday launch code provider'
end


def some_method
    @events.push({ 
        :name => 'test_widget' ,
        :data => {
            :a => "'#{SecureRandom.hex(8).upcase }' ",
            :b => "'#{SecureRandom.hex(8).upcase }' "
        }
    })
end

@scheduler.every '5s' do 
    some_method
end
