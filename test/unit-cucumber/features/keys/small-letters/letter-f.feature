@included
Feature: Letter f.
  Scenario Outline: f - toCharacterAt - Start
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands      | Lines | Columns |
      | f0    | toCharacterAt | 0     | 0       |

  Scenario Outline: f - toCharacterAt - Middle
    Given I activate Vim with the following input:
      """
      01\|2 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands      | Lines | Columns |
      | f0    | toCharacterAt | 0     | 2       |
      | f5    | toCharacterAt | 0     | 5       |


