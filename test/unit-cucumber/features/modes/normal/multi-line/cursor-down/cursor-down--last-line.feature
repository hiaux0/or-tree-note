Feature: Multi line - Cursor down - Last line.
  Scenario Outline: Multi line - Cursor down - Last line.
    Given I activate Vim with the following input:
      """
      foo
      \|bar
      """
    Given I'm in normal mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS   | TEXTS | COLUMNS | LINES |
      | u     | cursorDown | bar   | 0       | 1     |

