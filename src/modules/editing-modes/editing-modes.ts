import { logger } from "../debug/logger";
import { AbstractTextMode } from "../vim-editor/abstract-text-mode";
import {
  CURSOR_UP,
  CURSOR_DOWN,
  INSERT_MODE,
  SHIFT,
  SHIFT_KEY_CODE,
  MODIFIERS,
} from "./../../resources/keybindings/app.keys";
import {
  COMMAND_PALETT,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  ESCAPE,
} from "../../resources/keybindings/app.keys";
import { getCssVar, getValueFromPixelString } from "../css/css-variables";
import hotkeys from "hotkeys-js";
import { NormalTextMode } from "../vim-editor/normal-text-mode/normal-text-mode";
import { InsertTextMode } from "../vim-editor/insert-text-mode/insert-text-mode";
import { NormalTextModeKeybindings } from "../vim/modes/normal-mode-commands";
import keyBindingsJson from "../../resources/keybindings/key-bindings";
import { InsertTextModeKeybindings } from "../vim/modes/insert-mode-commands";
import { sendKeyEvent, sendKeySequence } from "modules/keys/keys";

export enum EditorModes {
  "NORMAL" = "NORMAL",
  "INSERT" = "INSERT",
}

const CARET_NORMAL_CLASS = "caret-NORMAL";
const CARET_INSERT_CLASS = "caret-INSERT";

function isHTMLElement(input): input is HTMLElement {
  if (typeof input === "string") return false;
  return true;
}

interface KeyBindingModes {
  normal: NormalTextModeKeybindings[];
  insert: InsertTextModeKeybindings[]; // TODO to instert
}

const keyBindings = (keyBindingsJson as unknown) as KeyBindingModes;

export class EditingModes {
  // currentModeName: EditorModes = EditorModes.INSERT;
  currentModeName: EditorModes = EditorModes.NORMAL;
  normalMode: NormalTextMode;
  InsertTextMode: InsertTextMode;
  modes: { [key: string]: AbstractTextMode };

  constructor(
    private parentElement: HTMLElement,
    private childSelector: string,
    private caretElement: HTMLElement
  ) {
    this.normalMode = new NormalTextMode(
      this.parentElement,
      this.childSelector,
      this.caretElement
    );

    this.InsertTextMode = new InsertTextMode(
      this.parentElement,
      this.childSelector,
      this.caretElement
    );
  }

  init() {
    this.initKeyBinding();
    this.initKeys();

    this.modes = {};
    this.modes[EditorModes.NORMAL] = this.normalMode;
    this.modes[EditorModes.INSERT] = this.InsertTextMode;

    sendKeySequence("llis");
    // sendKeyEvent("Backspace");
  }

  initKeyBinding() {
    // Init hotkeys
    hotkeys.noConflict();

    hotkeys.filter = function () {
      return true;
    }; // 2018-08-09 23:30:46 what does this do?
    let previousScope = hotkeys.getScope();

    hotkeys(COMMAND_PALETT, () => {
      hotkeys.setScope(previousScope);
    });
  }

  getCurrentMode() {
    logger.debug(["Current mode: %s", this.currentModeName]);

    return this.modes[this.currentModeName];
  }

  isInsertTextMode(currentMode): currentMode is InsertTextMode {
    return this.currentModeName === EditorModes.INSERT;
  }

  isNormalTextMode(currentMode): currentMode is NormalTextMode {
    return this.currentModeName === EditorModes.NORMAL;
  }

  getCommand(pressedKey: string) {
    const targetCommand = keyBindings[this.currentModeName.toLowerCase()].find(
      (binding) => binding.key === pressedKey
    );

    if (!targetCommand) {
      logger.debug([
        "No command for key: %s in Mode: %s",
        pressedKey,
        this.currentModeName,
      ]);
      return;
    }

    logger.debug(["Command: %s", targetCommand.command]);

    return targetCommand.command;
  }

  keyPressed(pressedKey: string) {
    const currentMode = this.getCurrentMode();

    if (this.isInsertTextMode(currentMode)) {
      if (pressedKey !== SHIFT) {
        const targetCommand = this.getCommand(pressedKey);
        currentMode.keyPressed(pressedKey, targetCommand);
      }
      return;
    }

    const targetCommand = this.getCommand(pressedKey);

    currentMode.keyPressed(pressedKey, targetCommand);
  }

  modifierKeyPressed(modifierKey: string) {
    const currentMode = this.getCurrentMode();
    //
    if (this.isInsertTextMode(currentMode)) {
      if (modifierKey !== SHIFT) {
        currentMode.modifierKeyPressed(modifierKey);
      }
      //
    } else if (this.isNormalTextMode(currentMode)) {
    }
  }

  initKeys() {
    hotkeys("*", (ev) => {
      logger.debug(["-------------- Key pressed: %s", ev.key]);

      if (
        MODIFIERS.includes(ev.key) &&
        this.currentModeName === EditorModes.INSERT
      ) {
        this.modifierKeyPressed(ev.key);
        return;
      }

      //
      if (
        ev.key === INSERT_MODE &&
        this.currentModeName === EditorModes.NORMAL
      ) {
        logger.debug("Enter Insert mode");

        this.currentModeName = EditorModes.INSERT;
        this.caretElement.classList.remove(CARET_NORMAL_CLASS);
        this.caretElement.classList.add(CARET_INSERT_CLASS);
        return;
        //
      } else if (ev.key === ESCAPE) {
        logger.debug("Enter Normal mode");

        this.currentModeName = EditorModes.NORMAL;
        this.caretElement.classList.remove(CARET_INSERT_CLASS);
        this.caretElement.classList.add(CARET_NORMAL_CLASS);
        return;
      }

      this.keyPressed(ev.key);
    });
  }
}
