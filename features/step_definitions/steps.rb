Given /^I am on the home page$/ do 
    visit('/') 
end

Given /^I am on the home page with paremeters$/ do
    visit('/?client=test_client&group=testing') 
end

Then /^I should see the client information form$/ do
    expect(page).to have_css('div#login') 
end

Given /^I have the the identifiers (.+) and (.+)$/ do |client, group|
    form = page.find('div#login')
    form.fill_in('client-name', with: client)
    form.fill_in('client-group', with: group)
    form.click_button('Connect')
end

Then /^I should not see the client information form$/ do
    expect(page).to  have_css('#login', visible: false)
end

Then /^I should see the list of available dashboards$/ do 
    expect(page).to have_css('#dashboard-list')
end


