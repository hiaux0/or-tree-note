@included
Feature: Letter d.
  Background:
    Given I activate Vim with the following input:
      """
      \|012 456
      """
    And I'm in normal mode.

  Scenario: diw deleteInnerWord
    When I type "diw"
    Then the expected commands should be "deleteInnerWord"
    And the cursors should be at line 0 and column 0
    And the texts should be " 456"

  Scenario: dd deleteLine
    When I type "dd"
    Then the expected commands should be "deleteLine"
    And the cursors should be at line 0 and column 0
    And the texts should be " 456"
