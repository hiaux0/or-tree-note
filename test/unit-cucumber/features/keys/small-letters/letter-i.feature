Feature: Letter i.
  Scenario: Start Normal - i
    Given I start Vim
    And I'm in Normal mode.
    When I type "i"
    Then the I should go into Insert mode
