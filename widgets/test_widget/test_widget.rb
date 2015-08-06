def setup 
    @logger.info 'This is code from  test widget.  WOO!'
end

@scheduler.every '2s' do 
    logger.info 'test widget says hello. Forever'
end
