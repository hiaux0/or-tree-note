Feature: Letter u.
  Scenario Outline: Cursor down - Multi line.
    Given I activate Vim with the following input:
      """
      \|foo
      bar
      """
    And I'm in normal mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS   | TEXTS | COLUMNS | LINES |
      | u     | cursorDown | bar   | 0       | 1     |

  Scenario Outline: Cursor down - Multi line  - Last line.
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
