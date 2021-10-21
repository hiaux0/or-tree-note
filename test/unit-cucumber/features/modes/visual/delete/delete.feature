Feature: Delete selection
  Background:
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.

  Scenario Outline: Delete selection
    When I queueInputSequence <INPUT>
    Then the expected commands should be <COMMANDS>
    And the cursors should be at line <LINES> and column <COLUMNS>
    And the texts should be <TEXTS>

    Examples:
      | INPUT | COMMANDS                                     | TEXTS         | COLUMNS | LINES |
      | viwd  | enterVisualMode,visualInnerWord,visualDelete | 012 456,, 456 | 0,2,0   | 0,,   |
      | viwx  | enterVisualMode,visualInnerWord,visualDelete | 012 456,, 456 | 0,2,0   | 0,,   |
