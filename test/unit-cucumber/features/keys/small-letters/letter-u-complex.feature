Feature: Letter u - complex.
  Background:
    Given I activate Vim with the following input:
      """
      \|hi
      012 456
      """
    And I'm in normal mode.

  Scenario Outline: uee
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | COMMANDS                         | Texts     | Columns | Lines |
      | uee   | cursorDown,cursorWordForwardEnd, | 012 456,, | 0,2,6   | 1,,   |

  Scenario Outline: ueek - Upper line shorter lower line.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | COMMANDS                                  | Texts        | Columns | Lines |
      | ueek  | cursorDown,cursorWordForwardEnd,,cursorUp | 012 456,,,hi | 0,2,6,1 | 1,,,0 |


