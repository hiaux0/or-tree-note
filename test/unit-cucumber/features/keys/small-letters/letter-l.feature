Feature: Letter l.
  Background:
    Given I activate Vim with the following input:
      """
      \|foo
      """
    And I'm in normal mode.

  Scenario Outline: Getting #queueInputSequence - Cursor.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | Commands                                     | Texts            | LINES   | Columns |
      | ll    | cursorRight,cursorRight                      | foo              | 0,0     | 1,2     |
      | lli!  | cursorRight,cursorRight,enterInsertMode,type | foo,foo,foo,fo!o | 0,0,0,0 | 1,2,2,3 |
