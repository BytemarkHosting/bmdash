Feature: User accesses web frontend 
    This set of scenarios encompass what a user should see when the first access
    the web front end.

    Scenario: Login with no identifiers
        Given I am on the home page
        Then I should see the client infomrmation form

    Scenario: Login and provide client name and group identifiers 
        Given I am on the home page
        And I have the the identifiers test_client and testing
        Then I should not see the client information form
        And I should see the list of dashboards

    Scenario: Automatic login with GET paremeter identifiers 
        Given I am on the home page with paremeters
        Then I should not see the client information form
        And I should see the list of dashboards

