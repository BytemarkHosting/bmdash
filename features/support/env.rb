require "cucumber"
require "capybara/cucumber"
require_relative "../../lib/bmdash"


Capybara.app = BMDash::App
