Feature: Letter F(capital).
  Scenario Outline: F - toCharacterAtBack - Middle
    Given I activate Vim with the following input:
      """
      012 4\|56
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands          | Lines | Columns |
      | F0    | toCharacterAtBack | 0     | 0       |
      | F6    | toCharacterAtBack | 0     | 5       |



