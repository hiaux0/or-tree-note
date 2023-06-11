import { Logger } from 'common/logging/logging';
import { isMac } from 'common/platform/platform-check';
import { CursorUtils } from 'modules/cursor/cursor-utils';
import { DomService } from 'modules/DomService';
import { SelectionService } from 'modules/SelectionService';
import rangy from 'rangy';
import { SPACE } from 'resources/keybindings/app-keys';
import { isTab, Modifier } from 'resources/keybindings/key-bindings';

import { VimCore } from './vim-core';
import {
  Cursor,
  QueueInputReturn,
  VimEditorOptionsV2,
  VimLine,
  VimMode,
} from './vim-types';
import { VimUi } from './vim-ui/vimUi';
import { isModeChangeCommand } from './vim-utils';

const logger = new Logger('VimInit');

/**
 * 1. Options
 *   - start cursor
 *   - start lines
 * 2. init key listener
 *   - differentiate between normal and insert mode
 * 3. afterInit
 *   - Eg. for automation, execute commands by sending keys
 */
export async function initVim(vimEditorOptionsV2: VimEditorOptionsV2) {
  let isComposing = false;

  const {
    startCursor,
    startLines,
    onBeforeCommand,
    commandListener,
    modeChanged,
    onCompositionUpdate,
    afterInit,
    plugins,
  } = vimEditorOptionsV2;
  // Vim
  const finalCursor: Cursor = startCursor ?? { col: 0, line: 0 };
  let finalLines: VimLine[];

  if (startLines?.length) {
    finalLines = startLines;
  } else {
    finalLines = [{ text: '123' }, { text: 'abc' }];
  }

  if (vimEditorOptionsV2.id) {
    vimEditorOptionsV2.vimState = {
      cursor: finalCursor,
      lines: finalLines,
    };
    vimEditorOptionsV2.vimState.id = vimEditorOptionsV2.id;
  }

  const vim = new VimCore(finalLines, finalCursor, {
    vimState: vimEditorOptionsV2.vimState,
    vimPlugins: plugins ?? [],
  });
  const vimUi = new VimUi(vim, vimEditorOptionsV2);

  //
  if (vimEditorOptionsV2.container) {
    await initKeys(vimEditorOptionsV2.container);
    await initMouse(vimEditorOptionsV2.container);
  }

  if (afterInit) {
    const afterResults = await afterInit(vim);

    if (afterResults) {
      afterResults.forEach((vimResult) => {
        if (isModeChangeCommand(vimResult.targetCommand)) {
          const updatedVimState = modeChanged(
            vimResult,
            vimResult.vimState.mode,
            undefined,
            vim
          );
          if (updatedVimState) {
            vim.vimState.updateVimState(updatedVimState);
          }
        } else {
          const updatedVimState = commandListener(vimResult, undefined, vim);
          if (updatedVimState) {
            vim.vimState.updateVimState(updatedVimState);
          }
        }
      });
    }
  }

  // Key listener
  async function initKeys(container: HTMLElement) {
    // Insert (Conteneditable) inptus
    container.addEventListener('keydown', (e) => {
      // console.clear();
      if (vim.vimState.mode !== VimMode.INSERT) return;
      /* prettier-ignore */ logger.culogger.debug(['Keydown']);
      void handleKeysInsert(e);
    });
    // Normal modes inputs
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    hotkeys('*', async (e) => {
      // might be obsolete, since not hit anyways, if `container` has focus
      if (vim.vimState.mode === VimMode.INSERT) return;
      /* prettier-ignore */ logger.culogger.debug(['Hotkeys']);
      await handleKeysNonInsert(e);
    });
    container.addEventListener('compositionstart', () => {
      isComposing = true;
    });
    container.addEventListener('input', (e) =>
      handleCompositionUpdate(e as CompositionEvent)
    );
    container.addEventListener('compositionend', () => {
      isComposing = false;
    });
  }

  async function handleKeysInsert(ev: KeyboardEvent) {
    ev.stopPropagation();
    //
    if (checkAllowedBrowserShortcuts(ev)) {
      return;
    }
    if (isComposing) {
      return;
    }
    if (onBeforeCommand) {
      const result = onBeforeCommand();
      if (result === false) {
        return;
      }
    }

    console.clear();

    //
    const pressedKey = getPressedKey(ev);
    const currentMode = vim.vimState.mode;
    switch (currentMode) {
      case VimMode.NORMAL: {
        if (pressedKey === 'i' || pressedKey === 'o') {
          // Bug, where an 'i' is typed, when switching from normal to insert
          ev.preventDefault();
        }
        break;
      }
      case VimMode.INSERT: {
        if (pressedKey === 'Process') {
          return;
        }
        break;
      }
    }

    const { collectedModifiers, modifiers } = assembleModifiers(ev);
    const result = await executeCommandInEditor(
      pressedKey,
      ev,
      collectedModifiers
    );
    if (result == null) return;

    // update UI
    updateUi(result);

    //
    const newMode = result.vimState.mode;
    if (isModeChangeCommand(result.targetCommand, currentMode, newMode)) {
      if (currentMode !== VimMode.INSERT) return;
      const curserFromInsert = SelectionService.getCursorFromSelection(
        vimEditorOptionsV2.container
      );
      // TODO: investigate the vimCore handling of cursorLeft from IN->NO
      vim.vimState.updateCursor(curserFromInsert);
      result.vimState.updateCursor(curserFromInsert);
      vimUi.update(vim.vimState);
      /**
       * STOP: When trying to setTimeout, the contenteditable border does not go away
       * setTimeout(() => { }, 0);
       */
      vimEditorOptionsV2.container.contentEditable = 'false';

      // Update text from insert (including new lines) to vimState
      const $inputLines =
        vimEditorOptionsV2.container.querySelectorAll('.inputLine');
      const linesFromInsert: VimLine[] = [];
      Array.from($inputLines).forEach((line) => {
        linesFromInsert.push({ text: line.textContent });
      });
      vim.vimState.lines = linesFromInsert;
      result.vimState.lines = linesFromInsert;

      const updatedVimState = modeChanged(result, newMode, currentMode, vim);
      if (updatedVimState) {
        vim.vimState.updateVimState(updatedVimState);
      }
    } else {
      if (!vimEditorOptionsV2.childSelector) return;

      const $childs = vimEditorOptionsV2.container.querySelectorAll(
        vimEditorOptionsV2.childSelector
      );
      let targetNode = $childs[result.vimState.cursor.line].childNodes[0];
      if (DomService.isTextNode(targetNode)) {
        if (vim.vimState.snippet) {
          const snippet = vim.vimState.snippet;
          const replaced = replaceSequenceWith(
            snippet.body.join(''),
            snippet.prefix.length,
            vim.vimState.lines[result.vimState.cursor.line].text
          );
          targetNode = replaced.node as ChildNode;
          updateUi(result);
        }
        vim.vimState.lines[result.vimState.cursor.line].text =
          targetNode.textContent;
      }

      const updatedVimState = commandListener(
        result,
        { pressedKey, ev, modifiersText: modifiers },
        vim
      );
      if (updatedVimState) {
        vim.vimState.updateVimState(updatedVimState);
      }
    }

    // Let browser input pass
    if (result.vimState.mode !== VimMode.INSERT) {
      ev.preventDefault();
    } else if (result.vimState.snippet) {
      ev.preventDefault();
    }
  }

  async function handleKeysNonInsert(ev: KeyboardEvent) {
    ev.stopPropagation();
    //
    if (checkAllowedBrowserShortcuts(ev)) {
      return;
    }
    if (isComposing) {
      return;
    }
    if (onBeforeCommand) {
      const result = onBeforeCommand();
      if (result === false) {
        return;
      }
    }

    console.clear();
    /* prettier-ignore */ console.log('%c------------------------------------------------------------------------------------------', `background: ${'darkblue'}`);

    //
    const pressedKey = getPressedKey(ev);

    const currentMode = vim.vimState.mode;
    switch (currentMode) {
      case VimMode.NORMAL: {
        if (pressedKey === 'i' || pressedKey === 'o') {
          // Bug, where an 'i' is typed, when switching from normal to insert
          ev.preventDefault();
        }
        break;
      }
      case VimMode.INSERT: {
        if (pressedKey === 'Process') {
          return;
        }
        break;
      }
    }

    const { collectedModifiers, modifiers } = assembleModifiers(ev);
    const result = await executeCommandInEditor(
      pressedKey,
      ev,
      collectedModifiers
    );
    if (result == null) return;

    // update UI
    updateUi(result);

    //
    const newMode = result.vimState.mode;
    if (isModeChangeCommand(result.targetCommand, currentMode, newMode)) {
      const cursor = result.vimState.cursor;
      setTimeout(() => {
        const $childs = vimEditorOptionsV2.container.querySelectorAll('div');
        if (!$childs) return;
        if (!$childs[cursor.line]) return;

        const targetNode = $childs[cursor.line].childNodes[0];
        const range = SelectionService.createRange(targetNode, cursor);

        vimEditorOptionsV2.container.contentEditable = 'true';
        vimEditorOptionsV2.container.focus();
        rangy.getSelection().setSingleRange(range);
      });

      const updatedVimState = modeChanged(result, newMode, currentMode, vim);
      if (updatedVimState) {
        vim.vimState.updateVimState(updatedVimState);
      }
    } else {
      const updatedVimState = commandListener(
        result,
        { pressedKey, ev, modifiersText: modifiers },
        vim
      );
      if (updatedVimState) {
        vim.vimState.updateVimState(updatedVimState);
      }
    }

    // Let browser input pass
    if (result.vimState.mode !== VimMode.INSERT) {
      ev.preventDefault();
    } else if (result.vimState.snippet) {
      ev.preventDefault();
    }
  }

  function handleCompositionUpdate(e: CompositionEvent): void {
    if (!vimEditorOptionsV2.childSelector) return;

    const $childs = (event.target as HTMLElement).querySelectorAll(
      vimEditorOptionsV2.childSelector
    );
    const targetNode = $childs[vim.vimState.cursor.line].childNodes[0];
    vim.vimState.updateLine(vim.vimState.cursor.line, targetNode.textContent);
    const range = SelectionService.getSingleRange();
    vim.vimState.updateCursor({
      line: vim.vimState.cursor.line,
      col: range.startOffset,
    });

    if (onCompositionUpdate) {
      onCompositionUpdate(vim, e);
    }
  }

  async function executeCommandInEditor(
    input: string,
    ev: KeyboardEvent,
    modifiers: string[]
  ) {
    if (vim.vimState.isInsertMode()) {
      if (isTab(input)) {
        ev.preventDefault();
      }
    }

    const result = await vim.queueInput(input, modifiers);
    // ev.preventDefault();

    return result;
  }

  async function initMouse(container: HTMLElement) {
    container.addEventListener('click', () => {
      const selection = document.getSelection();
      for (
        let rangeIndex = 0;
        rangeIndex < selection.rangeCount;
        rangeIndex++
      ) {
        const range = selection.getRangeAt(rangeIndex);
        const col = range.startOffset;
        const line = getLineIndex(range.startContainer);

        CursorUtils.updateCursor(vim.vimState, {
          line,
          col,
        });
        vimUi.update(vim.vimState);
      }
    });

    function getLineIndex(startContainer: Node): number {
      const $children = Array.from(container.children);
      const positionIndex = $children.indexOf(startContainer.parentElement);
      return positionIndex;
    }
  }

  function updateUi(result: QueueInputReturn) {
    vimUi.update(result.vimState);
    updateUiSetDocumentRange(result.vimState.cursor);
  }

  function updateUiSetDocumentRange(cursor: Cursor) {
    const $childs = vimEditorOptionsV2.container.querySelectorAll('div');
    if (!$childs) return;
    if (!$childs[cursor.line]) return;

    const targetNode = $childs[cursor.line].childNodes[0];
    const range = SelectionService.createRange(targetNode, cursor);

    rangy.getSelection().setSingleRange(range);
  }
}

export function assembleModifiers(ev: KeyboardEvent) {
  let modifiers = '';
  const collectedModifiers = [];
  if (ev.ctrlKey) {
    modifiers += 'Ctrl+';
    collectedModifiers.push(Modifier['<Control>']);
  }
  if (ev.shiftKey) {
    modifiers += 'Shift+';
    collectedModifiers.push(Modifier['<Shift>']);
  }
  if (ev.altKey) {
    modifiers += 'Alt+';
    collectedModifiers.push(Modifier['<Alt>']);
  }
  if (ev.metaKey) {
    modifiers += 'Meta+';
    collectedModifiers.push(Modifier['<Meta>']);
  }
  return { collectedModifiers, modifiers };
}

/**
 *
 */
function checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
  const mainModifier = isMac ? ev.metaKey : ev.ctrlKey;
  const reload = ev.key === 'r' && mainModifier;
  const hardReload = ev.key === 'R' && mainModifier && ev.shiftKey;
  if (reload || hardReload) {
    return true;
  } else if (ev.key === 'l' && mainModifier) {
    return true;
  } else if (ev.key === 'C' && mainModifier && ev.shiftKey) {
    return true;
  } else if (ev.key === '=' && mainModifier) {
    return true;
  } else if (ev.key === '-' && mainModifier) {
    return true;
  }

  // ev.preventDefault();
  return false;
}

function getPressedKey(ev: KeyboardEvent) {
  let pressedKey: string;
  if (ev.code === SPACE) {
    pressedKey = ev.code;
  } else {
    pressedKey = ev.key;
  }
  return pressedKey;
}

function replaceSequenceWith(
  text: string,
  snippetLength: number,
  wholeLine: string
): { node: Node; range: Range } | undefined {
  const sel = SelectionService.getSelection();
  if (sel?.rangeCount) {
    const range = sel.getRangeAt(0);

    const textNode = range.startContainer;
    textNode.textContent = wholeLine;
    const finalNewStart = text.length + range.startOffset - snippetLength + 1;
    const newStart = Math.max(
      finalNewStart, // account for char pressed, but not typed out
      0
    );
    range.setStart(textNode, newStart);
    range.deleteContents();
    sel.removeAllRanges();
    sel.addRange(range);

    return { node: sel.anchorNode, range };
  }
}
