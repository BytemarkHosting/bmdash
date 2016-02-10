def setup 
    @logger.info 'Fortune widget loaded!'
end


def my_fortune
    fortune = `fortune`
    fortune.gsub! /\n/, ' '
    fortune.gsub! /\t/, '    '
    fortune.gsub! /\\"/, ''
    fortune.gsub! /\\'/, ''

    @events.push({ 
        :name => 'fortune' ,
        :data => {
            :time => Time.now.to_i,
            :fortune => fortune
        }
    })
end

@scheduler.every '10s' do 
    my_fortune
end
