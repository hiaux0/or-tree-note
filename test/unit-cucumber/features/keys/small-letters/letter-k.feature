Feature: Letter k.
  Scenario Outline: Cursor up - Multi line - First line.
    Given I activate Vim with the following input:
      """
      \|foo
      bar
      """
    And I'm in normal mode.
    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS | TEXTS | COLUMNS | LINES |
      | k     | cursorUp | foo   | 0       | 0     |

  Scenario Outline: Cursor up - Multi line - Last line.
    Given I activate Vim with the following input:
      """
      foo
      \|bar
      """
    And I'm in normal mode.

    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS | TEXTS | COLUMNS | LINES |
      | k     | cursorUp | foo   | 0       | 0     |

