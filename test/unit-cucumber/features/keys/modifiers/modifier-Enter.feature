Feature: Modifier Enter.
  Scenario Outline: New Line - Start of line
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in insert mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input   | Commands | Texts   | Columns | Lines |
      | <Enter> | newLine  | 012 456 | 0       | 1     |

  Scenario Outline: New Line - Middle of line
    Given I activate Vim with the following input:
      """
      01\|2 456
      """
    And I'm in insert mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>
    And the previous line text should be <PreviousText>

    Examples:
      | Input   | Commands | Texts | PreviousText | Columns | Lines |
      | <Enter> | newLine  | 2 456 | 01           | 0       | 1     |

  Scenario Outline: New Line - Middle of line - Multiple
    Given I activate Vim with the following input:
      """
      01\|2 456
      789
      """
    And I'm in insert mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And there should be <Num_Lines> lines
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>
    And the previous line text should be <PreviousText>

    Examples:
      | Input   | Commands | Texts | PreviousText | Columns | Lines | Num_Lines |
      | <Enter> | newLine  | 2 456 | 01           | 0       | 1     | 3         |

  Scenario Outline: New Line - End of line
    Given I activate Vim with the following input:
      """
      012 456\|
      """
    And I'm in insert mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input   | Commands | Texts | Columns | Lines |
      | <Enter> | newLine  |       | 0       | 1     |
