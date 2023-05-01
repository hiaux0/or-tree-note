- [ ] [Normal]
- [ ] [Normal]

# TODO
  - [ ] [Normal] diw deletes the first word it encounters in the line
  - [ ] enter in normal should not split text
  - [ ] `queueInputSequence` should support <ctrl> (additionally to <Control>)

# Refactor
  - [ ] abstract-mode.ts - `toCharacterAtBack(commandInput: string): VimStateClass {` should be like
    ```ts
    toCharacterAtBack: TODOTYP = (commandInput: string): VimStateClass => {
    ```
    Because, some methods have an input, some don't. I want to make it clearer, what is available
    The methods, I'm using like `this[myMethod](inputs...)`

# Done

- .

  - [x] new line, then cannot up and down all the way
    - [x] src/modules/vim/vim-command-manager.ts 379
