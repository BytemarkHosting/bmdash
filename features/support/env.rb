require "cucumber"
require "capybara/cucumber"
require "capybara/webkit"
require "capybara/angular"
require "capybara/poltergeist"
require_relative "../../lib/bmdash"

include Capybara::Angular::DSL

Capybara.app = BMDash::App
#Capybara.default_driver = :webkit
Capybara.register_driver :poltergeist_debug do |app|
    Capybara::Poltergeist::Driver.new(app, :inspector => true)
end

Capybara.default_driver = :poltergeist_debug
