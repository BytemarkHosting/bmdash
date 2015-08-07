def setup 
    @logger.info 'Fortune widget loaded!'
end


def my_fortune
    fortune = `fortune`
    fortune.gsub! /\n/, '<br />'
    fortune.gsub! /\t/, '    '
    fortune.gsub! /\\"/, '"'
    fortune.gsub! /\\'/, '\''
    @events.push({ 
        :name => 'another_test_event' ,
        :data => {
            :time => Time.now.to_i,
            :fortune => fortune
        }
    })
end

@scheduler.every '10s' do 
    my_fortune
end
