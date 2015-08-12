require 'logger'
module BMDash

    LOG_INSTANCE = Logger.new(STDOUT)
    def self.logger
        LOG_INSTANCE
    end

    class BMDashError < RuntimeError; end

end
