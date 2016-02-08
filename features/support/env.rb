require "cucumber"
require "capybara/cucumber"
require "capybara/webkit"
require "capybara/angular"
require "capybara/poltergeist"
require_relative "../../lib/bmdash"

include Capybara::Angular::DSL

Capybara.app = BMDash::App
#Capybara.default_driver = :webkit
Capybara.default_driver = :poltergeist
