@included
Feature: Letter e.
  Scenario Outline: Cursor right - Word.
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.
    When I type <Input>
    Then the expected commands should be <Commands>
    And the cursors should be at line <Lines> and column <Columns>

    Examples:
      | Input | Commands             | Lines | Columns |
      | e     | cursorWordForwardEnd | 0     | 2       |
| eee   | cursorWordForwardEnd,, | 0,,   | 2,6,    |
