Feature: Letter k - complex.
  Background:
    Given I activate Vim with the following input:
      """
      hi
      012 456\|
      """
    And I'm in normal mode.

  Scenario Outline: Cursor up - Multi line - Lower line longer upper line.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the texts should be <TEXTS>
    And the cursors should be at line <LINES> and column <COLUMNS>

    Examples:
      | INPUT | COMMANDS | TEXTS | COLUMNS | LINES |
      | k   | cursorUp | hi    | 1       | 0     |

# @todo
# eeku should leave cursor at last position of below line
# Scenario Outline: Cursor up - Multi line - Lower line longer upper line.
#   When I queueInputSequence <INPUT>
#   Then the expected commands should be <COMMANDS>
#   And the texts should be <TEXTS>
#   And the cursors should be at line <LINES> and column <COLUMNS>

#   Examples:
#     | INPUT | COMMANDS                       | TEXTS       | COLUMNS | LINES |
#     | eek   | cursorWordForwardEnd,,cursorUp,cursorDown | 012 456,,hi,012 456 | 2,6,1,6   | 1,1,0,1
#                                                                                       ^ todo: is 1
