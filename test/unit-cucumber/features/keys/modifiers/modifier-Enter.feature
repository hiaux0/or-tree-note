Feature: Modifier Enter.
  Scenario Outline: New Line - Start of line
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in insert mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT   | COMMANDS | TEXTS   | COLUMNS | LINES |
      | <Enter> | newLine  | 012 456 | 0       | 1     |

  Scenario Outline: New Line - Middle of line
    Given I activate Vim with the following input:
      """
      01\|2 456
      """
    And I'm in insert mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>
    And the previous line text should be <PreviousText>

    Examples:
      | INPUT   | COMMANDS | TEXTS | PreviousText | COLUMNS | LINES |
      | <Enter> | newLine  | 2 456 | 01           | 0       | 1     |

  Scenario Outline: New Line - Middle of line - Multiple
    Given I activate Vim with the following input:
      """
      01\|2 456
      789
      """
    And I'm in insert mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And there should be <NUM_LINES> lines
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>
    And the previous line text should be <PreviousText>

    Examples:
      | INPUT   | COMMANDS | TEXTS | PreviousText | COLUMNS | LINES | NUM_LINES |
      | <Enter> | newLine  | 2 456 | 01           | 0       | 1     | 3         |

  Scenario Outline: New Line - End of line
    Given I activate Vim with the following input:
      """
      012 456\|
      """
    And I'm in insert mode.
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT   | COMMANDS | TEXTS | COLUMNS | LINES |
      | <Enter> | newLine  |       | 0       | 1     |
