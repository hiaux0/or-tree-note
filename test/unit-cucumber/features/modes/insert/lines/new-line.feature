Feature: New Line
  Background:
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in insert mode.

  @focus
  Scenario Outline: New Line
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT   | COMMANDS | TEXTS | COLUMNS | LINES |
      | <Enter> | newLine  |     | 0       | 1     |
