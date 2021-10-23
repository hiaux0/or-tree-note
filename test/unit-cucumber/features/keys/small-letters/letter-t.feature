Feature: Letter t.
  Scenario Outline: t - toCharacterBefore - Start
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
      | t0    | toCharacterBefore | 0     | 0       |

  # @focus
  Scenario Outline: t - toCharacterBefore - Middle
    Given I activate Vim with the following input:
      """
      01\|2 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands          | Lines | Columns |
      | t0    | toCharacterBefore | 0     | 2       |
      | t5    | toCharacterBefore | 0     | 4       |

