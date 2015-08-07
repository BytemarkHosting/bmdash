def setup 
    @logger.info 'This is code from  test widget.  WOO!'
end


def some_method
    @events.push({ 
        :name => 'test_event' ,
        :data => {
            :a => 'This is A',
            :b => 'This is B'
        }
    })
end

@scheduler.every '10s' do 
    logger.info "test_widget has made an event" 
    some_method
end
