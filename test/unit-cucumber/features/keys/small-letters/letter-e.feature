Feature: Letter e.
  Scenario Outline: Cursor right - Word.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>

    Examples:
      | INPUT | COMMANDS               | LINES | COLUMNS |
      | e     | cursorWordForwardEnd   | 0     | 2       |
      | eee   | cursorWordForwardEnd,, | 0,,   | 2,6,    |
