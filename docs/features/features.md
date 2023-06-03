# Html mode

- navigation
- crud

  - adding nodes
    - [ ] after current

- moving mode

  - v then m
  - [ ] move between containers
    - v, m, select target,
      - <ctrl>[ (indentLeft) (signal to move outside WITH target)
      - (indentRight) to go inside (add target at last position)
  - children
    - v, m
      - "c" to make target the child of the previous one
  - [ ] temp changes
    - [ ] moving should only be temp, only upon <esc> the changes should be commited
    - [ ] indicate moving style

- [ ] paste
  ```ts
  document.addEventListener('paste', (event) => {
    /* prettier-ignore */ console.log('TCL ~ file: vim-html-connection.ts ~ line 29 ~ VimHtmlConnection ~ document.addEventListener ~ event', event);
    let paste = (event.clipboardData || (window as any).clipboardData).getData(
      'text'
    );
    /* prettier-ignore */ console.log('TCL ~ file: vim-html-connection.ts ~ line 30 ~ VimHtmlConnection ~ document.addEventListener ~ paste', paste);
    paste = paste.toUpperCase();
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    event.preventDefault();
  });
  ```

# Architecture New

- .
  - VimCore/VimEngine
    - Modes
      - Normal
      - Insert
      - Visual
      - VisualLine
    - Cursor
    - Lines
    - Plugins
    - Other Features
  - VimUi
    - Showing different Modes
    - User Input
      - Handle user input/events

# Architecture Old

- .

  - to easily hook into different modes
  - [ ] Support different "containers"

    - How?

      - Control via pure HTML
      - Control via Aurelia (`{id: string}`)
        | | pro | con |
        | ------- | ------------------------------ | ------------ |
        | html | Easily navigate to any element | CRUD harder? |
        | Aurelia | Harder | Easier |

      CRUD

      - HTML: problem might be, when moving elments around, we would insert them via js-html methods

        - which might break other fncalities? (like enter vim text mode)

        - ! Might not be possible at all
          - imagine changing the text
            - how would that look like?
              - you would need to save the text --> need a model `{text: string}`
              - with pure HTML, how would you change text?
                - just change the text content?
                  - then how do you save it?
                    - [DECISION] Aurelia

      - [ ] Aurelia multi control
        - [ ] `<vim-html>` with slot?
