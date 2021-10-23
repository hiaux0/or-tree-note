Feature: Letter t.
  @focus
  Scenario Outline: t - toCharacterBefore
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands          | Lines | Columns |
      | t2    | toCharacterBefore | 0     | 2       |

