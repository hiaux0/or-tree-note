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
      | Input | Commands                          | Texts      | Lines | Columns |
      | ll    | cursorRight,                      | foo        | 0,    | 1,2     |
      | lli!  | cursorRight,,enterInsertMode,type | foo,,,fo!o | 0,,,  | 1,2,,3  |
