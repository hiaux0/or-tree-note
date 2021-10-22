Feature: Modifier Escape.
  Scenario: Start Insert - Escape
    Given I start Vim
    And I'm in Insert mode.
    When I type "<Escape>"
    Then the I should go into Normal mode

  Scenario: Start Visual - Escape
    Given I start Vim
    And I'm in Visual mode.
    When I type "<Escape>"
    Then the I should go into Normal mode
