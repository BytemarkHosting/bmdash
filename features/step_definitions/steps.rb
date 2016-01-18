Given /^I am on the home page$/ do 
   visit('/') 
end

Then /^I should see the client infomrmation form$/ do
    assert(page.has_css?('div#login'))
end

Then /^I should see a list of available dashboards$/ do 
    dashboards = locate('#dashboard-list')
    puts dashboards.inspect
    pending
end

