Feature: Letter h.
  Scenario Outline: Cursor right - Character.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | COMMANDS   | Lines | Columns |
      | h     | cursorLeft | 0     | 0       |
