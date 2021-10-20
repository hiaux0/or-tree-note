Feature: Delete
  Background:
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.

  Scenario: Getting #queueInput
    When I queueInputSequence "diw"
    Then the expected commands should be "deleteInnerWord"
    And the cursors should be at line 0 and column 0
    And the texts should be " 456"
