- [ ] [Normal]
- [ ] [Normal]

# TODO
  - [ ] [Normal] diw deletes the first word it encounters in the line
  - [ ] enter in normal should not split text
  - [ ] `queueInputSequence` should support <ctrl> (additionally to <Control>)

# Bug
  - [x][fold]
    ```
      loem oditoa abcdeheeof 89

      012 456
      |next thing  // <--- fold here folds the two lines below, + some ui issue

      What do I need to make this work?
          handy shortcuts over

      text snippets
      tags
      templates
    ```
  - [ ][indent] `    |hello` Indenting too much, will put cursor out of bound on the left

# Refactor
  - [ ] abstract-mode.ts - `toCharacterAtBack(commandInput: string): VimStateClass {` should be like
    ```ts
    toCharacterAtBack: TODOTYP = (commandInput: string): VimStateClass => {
    ```
    Because, some methods have an input, some don't. I want to make it clearer, what is available
    The methods, I'm using like `this[myMethod](inputs...)`
  - [ ] `initial-state.ts` remove `lines`  in `VimEditorState`

# Done

- .

  - [x] new line, then cannot up and down all the way
    - [x] src/modules/vim/vim-command-manager.ts 379
