Feature: Letter b.
  Scenario Outline: Cursor left - Word - Start.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>

    Examples:
      | INPUT | COMMANDS                 | LINES | COLUMNS |
      | b     | cursorBackwordsStartWord | 0     | 0       |

  Scenario Outline: Cursor left - Word - End.
    Given I activate Vim with the following input:
      """
      012 45\|6
      """
    And I'm in normal mode.
    When I type <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>

    Examples:
      | INPUT | COMMANDS                  | LINES | COLUMNS |
      | b     | cursorBackwordsStartWord  | 0     | 4       |
      | bb    | cursorBackwordsStartWord, | 0,    | 4,0     |
