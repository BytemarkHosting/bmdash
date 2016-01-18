require "cucumber"
require "capybara/cucumber"
require "capybara/webkit"
require_relative "../../lib/bmdash"


Capybara.app = BMDash::App
Capybara.default_driver = :webkit
