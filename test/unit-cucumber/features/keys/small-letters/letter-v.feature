Feature: Letter v.
  Scenario: Start Normal - v
    Given I start Vim
    And I'm in Normal mode.
    When I type "v"
    Then the I should go into Visual mode


  # @todo
  # Scenario: Start Normal - V(capital)
  #   Given I start Vim
  #   And I'm in Normal mode.
  #   When I type "V"
  #   Then the I should go into Visual mode

  Scenario: Delete selection
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
      | Input | Commands                                     | Texts         | Columns | Lines |
      | viwd  | enterVisualMode,visualInnerWord,visualDelete | 012 456,, 456 | 0,2,0   | 0,,   |
      | viwx  | enterVisualMode,visualInnerWord,visualDelete | 012 456,, 456 | 0,2,0   | 0,,   |

