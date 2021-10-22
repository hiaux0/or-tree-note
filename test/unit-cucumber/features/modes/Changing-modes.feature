Feature: Changing Modes.
  Scenario: Start Insert - Escape
    Given I start Vim
    And I'm in Insert mode.
    When I queueInput "<Escape>"
    Then the I should go into Normal mode

  Scenario: Start Normal - i
    Given I start Vim
    And I'm in Normal mode.
    When I type "i"
    Then the I should go into Insert mode

  Scenario: Start Normal - v
    Given I start Vim
    And I'm in Normal mode.
    When I type "v"
    Then the I should go into Visual mode

  # @todo
  # Scenario: Start Normal - V(capital)
  #   Given I start Vim
  #   And I'm in Normal mode.
  #   When I type "V"
  #   Then the I should go into Visual mode

  Scenario: Start Visual - Escape
    Given I start Vim
    And I'm in Visual mode.
    When I type "<Escape>"
    Then the I should go into Normal mode
