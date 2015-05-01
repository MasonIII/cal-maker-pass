Feature: Pagination

  As a user
  I want to be able to see a paginated inventory
  So that it is easy to find and look around the inventory

Background:
 
    Given the following items exist:
    | name | price | quantity | status | kind | 
    | item1 | 4.0 | 5 | sell | EE |  
    | item2 | 4.0 | 1 | sell | EE |  
    | item3 | 3.0 | 0 | sell | EE |  
    | item4 | 3.0 | 0 | lend | EE |
    | item5 | 4.0 | 5 | sell | EE |  
    | item6 | 4.0 | 5 | sell | EE |  
    | item7 | 4.0 | 1 | sell | EE |  
    | item8 | 3.0 | 0 | sell | EE |  
    | item9 | 3.0 | 0 | lend | EE |
    | item10 | 4.0 | 5 | sell | EE |
    | item11 | 4.0 | 5 | sell | EE |  
    | item12 | 4.0 | 1 | sell | EE |  
    | item13 | 3.0 | 0 | sell | EE |  
    | item14 | 3.0 | 0 | lend | EE |
    | item15 | 4.0 | 5 | sell | EE |
    | item16 | 4.0 | 5 | sell | EE |  
    | item17 | 4.0 | 1 | sell | EE |  
    | item18 | 3.0 | 0 | sell | EE |  
    | item19 | 3.0 | 0 | lend | EE |
    | item20 | 4.0 | 5 | sell | EE |
    | item21 | 4.0 | 5 | sell | EE |
    | item22 | 4.0 | 5 | sell | EE |

    And a user is logged in 

Scenario: I should see first items only
    I should see "item1"
    I should see "item12"
    I should see "item20"
    I should not see "item21"

@javascript
Scenario: I should see other items on next page
    I should see "item1"
    find("2").click
    Then I should see "item22"
    And I should not see "item1"
 

