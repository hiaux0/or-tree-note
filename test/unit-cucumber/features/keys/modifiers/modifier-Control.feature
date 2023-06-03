@included
Feature: Modifier Control.
  Scenario Outline: Control+] - Indent Right
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the texts should be <Texts>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input      | Commands    | Texts         | Columns | Lines |
      | <Control>] | indentRight | `    012 456` | 4       | 0     |

  Scenario Outline: Control+[ - Indent Left
    Given I activate Vim with the following input:
      """
      `    \|012 456`
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the texts should be <Texts>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input      | Commands   | Texts   | Columns | Lines |
      | <Control>[ | indentLeft | 012 456 | 0       | 0     |
