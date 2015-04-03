Feature: Add item to the inventory

  As an admin
  I want to be able to add products to the inventory
  So that I can sell these items

Background: items have been added to the database

    Given the following items exist:
    | name | price | quantity | status | kind | 
    | capacitor | 4.0 | 5 | sell | EE |  
    | resistor | 4.0 | 1 | sell | EE |  
    | conductor | 3.0 | 0 | sell | EE |  
    | screw | 3.0 | 0 | lend | EE |  

# Scenario: add a duplicate item to inventory
#     When I manually add item: capacitor, 3.0, 3, both, EE
#     Then I should see 'duplicate item'

Scenario: add a new item to inventory
    When I manually add item: led, 4.0, 10, sell, EE
    Then I should see "successfully added"

Scenario: add a item with invalid price
    When I manually add item: capacitor, hello , 3, both, EE
    Then I should see "invalid price"

Scenario: add a item with invalid quantity
    When I manually add item: capacitor, 3.75 , -1, lend, EE
    Then I should see "invalid quantity"

Scenario: add a item with invalid quantity
    When I manually add item: capacitor, , -1, lend, EE
    Then I should see "please fill in all fields"
