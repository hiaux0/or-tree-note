- [ ] [Normal]

# Current
- .
  - [ ] every
    - [ ] commands
      - CommandService
      - ShortcutService
      -
    - [x] cursor ui
      - [x] clicking in normal mode should update cursor
      - [x] listener for non-insert mode

# Feat

- .

  - [ ] [debug] history to access state, so I can reproduce the issue
  - [ ] /\*_ ISSUE-jMia9Mjf: overwrite for now, should add managing _/

  ## Done Feat

  - [x] [testing] write about, why I'm not doing tdd anymore
    - because had too many different steps hello world, what

# Bug

- .

  ## Current

  ## Backlog

  - [ ] [diw] when many whitespaces, shoudl delete them all
  - [ ][r] rr not working (tt, ff, TT, FF)
    - DO, should wo afte refactoring whole command and (awaiting command) handling
  - [ ] joining lines in insert then ESC -> deletes all
    - --> !!!! big issue: rendering not working somehow
    - the state in vim is there, but html breaks
      - [ ] re-consider insert<>normal rendering
      - [ ] try au2?

  ## Done

  - [x] await this.queueInputSequence('u^'); // TODO: side effect? why works without assigning to `vimState`?
    - whole core is based on mutation (`abstract-mode.t`s)
  - [x][r] r -> <ESC> -> writes escape
  - [x][t] not workgin
  - [x][f] not supporting going to upper case chars (because of queued shift)
  - [x] [Normal] diw deletes the first word it encounters in the line
  - [x][cc] does not clear line
  - [x][indent] ` |hello` Indenting too much, will put cursor out of bound on the left
  - [x] [$] at start of empty line goes to -1
  - [x] [r] replaced not reflected in UI (have to go to insert mode to see)
  - [x] fix testing
  - [x] [nor] 'o' on vim with only one line throws some error
    - not repro
  - [x] enter in normal should not split text
    - should: next line, start of line (do, when chaining vim commands is easier?)
      - --> queueInputSequence

# Code Enhancements

- .

  - [ ] [multiple] /\*_ ISSUE-xC83cN1d: remove lines and cursore, for vimOptions. (or take vimState from vimOptions) _/
  - [ ] [multiple] currently multiple listens to all key presses / commands? Maybe add option, to just listen to specific commands
  - [ ] allow caret and container option have selector (and not element itself)
  - [ ] [refac] `vim-init.ts` and the composition handling should go into `vim-core.t`s
  - [ ] [refac] unify modifier behavior (Shift vs <Shift>)
  - [ ] multi cursor

    - [ ] `queueInputSequence` should support <ctrl> (additionally to <Control>)

  - [ ] [paste] in insert, paste keeps formatting.. Want?
  - [ ] [refac] consider making vim-core nodejs compatible (currently, for paste, has `navigator`)
    - move to `vim-init` instead?
      - since it has Browser code
    - background, just thought, it might be helpful to differentiate
  - [ ] [snippets] cursor placeholder support (`$1 $0`)
  - [ ] show whitespace &zwnj;

  ## Later

  - .
  - [ ] consider another code highlightin library
    - https://github.com/shikijs/shiki
    - [ ] text replacements - WITH composition possiliibty (eg. ,a , cause a can become â)
      - do when find annoying
    - [ ] highilgiht on every keystroke (to register when I type eg. "#" as md header)
      - later: need to do some children mutation observation (abstract-text-mode.ts)?
  - obsolete? -> not using actions anymore in `minimal-notes`
    - [x] changeText should not execute 2 actions (1 changeText 2 changeVimState (the cursor to the right))
      - could be part of a bigger refactor, where I want to compose the vim actions more
    - [x] undo/redo should not trigger on every keystroke
      - eg. when I type "hello", and then undo, then the whole word "hello" should be undone, and not every char

  ## Done Code Enhancements

  - [x] [modes] differentiate for <Esc>, if a mode change, or cancelling

# Refactoring

- .

  - [ ] input + modifiers (shift,t -> <Shift>t) as some service
  - [ ] (vim-init.ts) vim-notes.ts should also use API similar to `initVim`

# Refactor

# Done

- .
  - [x] switch editors
  - [x] add editors
  - [x] remove editors

  - [x] enter in insert
  - [x] cursor in insert
    - take from click changing

  - [x] [Editor] text replacements
  - [x] [Editor] code highlighting
  - [x] Vn Input mode

    ## Done

    - [x] fix paste
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
