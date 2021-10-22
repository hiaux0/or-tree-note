Feature: Letter b.
  Scenario Outline: Cursor left - Word - Start.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands                 | Lines | Columns |
      | b     | cursorBackwordsStartWord | 0     | 0       |

  Scenario Outline: Cursor left - Word - End.
    Given I activate Vim with the following input:
      """
      012 45\|6
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands                  | Lines | Columns |
      | b     | cursorBackwordsStartWord  | 0     | 4       |
      | bb    | cursorBackwordsStartWord, | 0,    | 4,0     |
