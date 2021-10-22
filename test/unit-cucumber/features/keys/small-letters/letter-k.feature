Feature: Letter k.
  Scenario Outline: Cursor up - Multi line - First line.
    Given I activate Vim with the following input:
      """
      \|foo
      bar
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | Commands | Texts | Columns | Lines |
      | k     | cursorUp | foo   | 0       | 0     |

  Scenario Outline: Cursor up - Multi line - Last line.
    Given I activate Vim with the following input:
      """
      foo
      \|bar
      """
    And I'm in normal mode.

    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | Commands | Texts | Columns | Lines |
      | k     | cursorUp | foo   | 0       | 0     |

