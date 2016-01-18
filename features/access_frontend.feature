Feature: User accesses web frontend 

    Scenario: Login with no identifiers
        Given I am on the home page
        Then I should see the client infomrmation form

    Scenario: Login with client name and group identifiers 
        Given I am on the home page
        Then I should see a list of available dashboards
