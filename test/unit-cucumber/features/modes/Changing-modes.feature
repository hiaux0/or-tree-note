Feature: Changing Modes - Start Insert
  @focus
  Scenario: Escape
    Given I have the following content
    And I start in the Insert
    When I press Escape
    Then the content did not changed

