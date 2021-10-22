Feature: Letter h.
  Scenario Outline: Cursor right - Character.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>

    Examples:
      | INPUT | COMMANDS   | LINES | COLUMNS |
      | h     | cursorLeft | 0     | 0       |
