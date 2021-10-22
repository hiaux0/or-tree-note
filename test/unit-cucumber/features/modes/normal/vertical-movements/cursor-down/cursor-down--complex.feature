Feature: Cursor Down - Complex.
  Background:
    Given I activate Vim with the following input:
      """
      \|hi
      012 456
      """
    And I'm in normal mode.

  Scenario Outline: uee
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS                         | TEXTS     | COLUMNS | LINES |
      | uee   | cursorDown,cursorWordForwardEnd, | 012 456,, | 0,2,6   | 1,,   |

  Scenario Outline: ueek - Upper line shorter lower line.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS                                  | TEXTS        | COLUMNS | LINES |
      | ueek  | cursorDown,cursorWordForwardEnd,,cursorUp | 012 456,,,hi | 0,2,6,1 | 1,,,0 |

