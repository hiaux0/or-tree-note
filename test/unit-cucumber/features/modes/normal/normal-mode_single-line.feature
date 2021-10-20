Feature: Normal mode - Sequenced commands - Single input.
  Background:
    Given I activate Vim with the following input:
      """
      \|foo
      """
    And I'm in normal mode.

  Scenario: Getting #queueInput
    When I queueInput "u"
    Then the expected command should be "cursorDown"
    And the cursor should be at line 0 and column 0

  Scenario Outline: Getting #queueInputSequence - Cursor.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS                                     | TEXTS            | COLUMNS | LINES   |
      | u     | cursorDown                                   | foo   | 0       | 0       |
      | ll    | cursorRight,cursorRight                      | foo   | 1,2     | 0,0     |
      | lli!  | cursorRight,cursorRight,enterInsertMode,type | foo,foo,foo,fo!o | 1,2,2,3 | 0,0,0,0 |
