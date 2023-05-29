- [ ] [Normal]

# Current

- .

  - Vn Input mode

    ## Bugs

    - [ ] fix paste

    ## Enhancement

    - [ ] text replacements - WITH composition possiliibty (eg. ,a , cause a can become â)
    - [ ] highilgiht on every keystroke (to register when I type eg. "#" as md header)

    ## Done

    - [x] text duped
      - new line, esc
      - bug: --> duped
    - [x] snippets, for ",a", inserts the a here: () => {a}
      - if snippet, preventdefault?
      - bug in insert-mode.ts
    - [x] multi line (not just first one)
    - [x] show cursor and current text
    - [x] saving
    - [x] `Process` sometimes appears, and lets the cursor jump

      - not consistently repoducible, have to type fast-ish

    - [x] add cursor back
    - [x] text replacements

      - [x] cursor
      - [x] show in output

    - [x] "Process" and cursor col position --> use vim instance directly

    - [x] rangy

      - [x] get selection
      - [x] restore selection NORML->INSE

    - [x] contenteditable div

      - [x] replacement should go back to input
      - [x] text changes should go to vim

      - [x] init
      - [x] get input lines
        - [x] how to transfer to VIM
          - --> create vim-init.ts
      - [x] put into vim

      - [x] update cursor
        - background: when I change the cursor inside cediv, the text gets added to the start position
          - [x] get selection from browser
          - [x] update inside vim
            - ! consider method name: `setCursorInternally`
              - one reason, for later undo redo, we may just want to change the state, without having to dispatch an action
                - [ ] will then have to listen to text changes outside of the store
      - [x] update text

# Feat

- .

  - [ ] [Editor] code highlighting
  - [ ] [testing] write about, why I'm not doing tdd anymore
  - [ ] [debug] history to access state, so I can reproduce the issue

# Code Enhancements

- .
  - [ ] allow caret and container option have selector (and not element itself)
  - [ ] [modes] differentiate for <Esc>, if a mode change, or cancelling
    - background, just thought, it might be helpful to differentiate
  - [ ] `queueInputSequence` should support <ctrl> (additionally to <Control>)
  - [ ] [snippets] cursor changing (`$1 $0`)
  - [ ] [Editor] text replacements
  - [ ] changeText should not execute 2 actions (1 changeText 2 changeVimState (the cursor to the right))
    - could be part of a bigger refactor, where I want to compose the vim actions more
  - [ ] show whitespace &zwnj;
  - [ ] consider another code highlightin library
    - https://github.com/shikijs/shiki
  - [ ] undo/redo should not trigger on every keystroke
    - eg. when I type "hello", and then undo, then the whole word "hello" should be undone, and not every char

# Refactoring

- .

  - [ ] input + modifiers (shift,t -> <Shift>t) as some service
  - [ ] (vim-init.ts) vim-notes.ts should also use API similar to `initVim`

# Bug

- .
  - [ ] enter in normal should not split text
  - [ ] [Normal] diw deletes the first word it encounters in the line
  - [ ][indent] ` |hello` Indenting too much, will put cursor out of bound on the left
  - [ ][t] not supporting going to upper case chars (because of queued shift)
  - [ ][cc] does not clear line

# Refactor

# Done

- .

  - [x][o] currently, only looks at word vs whitespace and symbols
    - --> should only whitespace
  - [x] [esc] from insert into normal should put cursor one back
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

  - [x][--] add executing method, insteadof
    --> some issues around types and public method access of methods
    `await currentMode[result.targetCommand](result.vimState);`

    - with current approach, it is hard to understand where exactly methods of each modes are executed

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

---

cediv - contenteditable div
