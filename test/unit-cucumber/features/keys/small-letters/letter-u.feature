Feature: Letter u.
  Scenario Outline: Cursor down - Multi line.
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
      | Input | Commands   | Texts | Columns | Lines |
      | u     | cursorDown | bar   | 0       | 1     |

  Scenario Outline: Cursor down - Multi line  - Last line.
    Given I activate Vim with the following input:
      """
      foo
      \|bar
      """
    Given I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | Commands   | Texts | Columns | Lines |
      | u     | cursorDown | bar   | 0       | 1     |
