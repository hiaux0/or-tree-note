Feature: Letter T(capital).
  @focus
  Scenario Outline: T - toCharacterAfterBack - Middle
    Given I activate Vim with the following input:
      """
      012 4\|56
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands             | Lines | Columns |
      | T0    | toCharacterAfterBack | 0     | 1       |
      | T6    | toCharacterAfterBack | 0     | 5       |




