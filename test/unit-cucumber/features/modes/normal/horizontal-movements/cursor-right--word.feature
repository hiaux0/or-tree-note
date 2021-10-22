Feature: Cursor right - Word.

  Scenario Outline: Cursor right - Word.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>

    Examples:
      | INPUT | COMMANDS               | COLUMNS | LINES |
      | e     | cursorWordForwardEnd   | 2       | 0     |
      | eee   | cursorWordForwardEnd,, | 2,6,    | 0,,   |
