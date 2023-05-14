- [ ] [Normal]


# Current
  - [ ] [esc] from insert into normal should put cursor one back

# Feat
  - [ ] [Editor] code highlighting

# Code Enhancements
  - [ ] `queueInputSequence` should support <ctrl> (additionally to <Control>)
  - [ ] [snippets] cursor changing (`$1 $0`)
  - [ ] [Editor] text replacements
  - [ ] changeText should not execute 2 actions (1 changeText 2 changeVimState (the cursor to the right))
    - could be part of a bigger refactor, where I want to compose the vim actions more
  - [ ] add executing method, insteadof 
    `await currentMode[result.targetCommand](result.vimState);`
    - with current approach, it is hard to understand where exactly methods of each modes are executed

# Bug
- .
  - [ ] enter in normal should not split text
  - [ ] [Normal] diw deletes the first word it encounters in the line
  - [ ][indent] ` |hello` Indenting too much, will put cursor out of bound on the left
  - [ ][t]  not supporting going to upper case chars (because of queued shift)
  - [ ][cc] does not clear line

# Refactor


# Done
- .
  - [x] [Editor] text suggestions/snippets
  ```json
		{ "before": [",", "a"], "commands": [{"command": "type", "args": {"text": "() => {}"}}]},
  ```

  - [x] `initial-state.ts` remove `lines` in `VimEditorState`

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

  - [x] new line, then cannot up and down all the way
    - [x] src/modules/vim/vim-command-manager.ts 379

# Not possible
- .

  - [x][--] abstract-mode.ts - `toCharacterAtBack(commandInput: string): VimStateClass {` should be like
    --> not possible, since in `visual-mode.ts` I got an error for
    `void super.cursorWordForwardEnd();`

    ```ts
    (property) AbstractMode.cursorWordForwardEnd: (commandInput?: string) => VimStateClass | Promise<VimStateClass>
      Only public and protected methods of the base class are accessible via the 'super' keyword.ts(2340)
    ```

    ```ts
    toCharacterAtBack: TODOTYP = (commandInput: string): VimStateClass => {
    ```

    Because, some methods have an input, some don't. I want to make it clearer, what is available
    The methods, I'm using like `this[myMethod](inputs...)`
