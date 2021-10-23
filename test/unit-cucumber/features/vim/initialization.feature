Feature: Initialize Vim.
  Scenario: Initialize Vim
    Given I activate Vim with the following input:
      """
      012
      45\|6
      789
      """
    Then the cursor position should be in line 1 and column 2
    And the lines should be ["012","456","789"]

  Scenario: Initialize Vim - With whitespace
    Given I activate Vim with the following input:
      """
      `    \|012 456`
      """
    Then the cursor position should be in line 0 and column 4
    And the lines should be ["    012 456"]
