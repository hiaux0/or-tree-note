@included
Feature: Letter x.
  Scenario Outline: Delete Character.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>
    And the texts should be <Texts>

    Examples:
      | Input | Commands | Lines | Columns | Texts  |
      | x     | delete   | 0     | 0       | 12 456 |

