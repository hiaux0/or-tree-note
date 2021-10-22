Feature: Cursor up - Multi line.
  Background:
    Given I activate Vim with the following input:
      """
      \|foo
      bar
      """
    And I'm in normal mode.

  Scenario Outline: Cursor up - Multi line - First line.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS | TEXTS | COLUMNS | LINES |
      | k     | cursorUp | foo   | 0       | 0     |
