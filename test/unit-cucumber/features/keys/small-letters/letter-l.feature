Feature: Letter l.
  Background:
    Given I activate Vim with the following input:
      """
      \|foo
      """
    And I'm in normal mode.

  Scenario Outline: Getting #queueInputSequence - Cursor.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS                                     | TEXTS            | COLUMNS | LINES   |
      | ll    | cursorRight,cursorRight                      | foo              | 1,2     | 0,0     |
      | lli!  | cursorRight,cursorRight,enterInsertMode,type | foo,foo,foo,fo!o | 1,2,2,3 | 0,0,0,0 |
