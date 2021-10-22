Feature: Letter x.
  Scenario Outline: Delete Character.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS | LINES | COLUMNS | TEXTS  |
      | x     | delete   | 0     | 0       | 12 456 |

