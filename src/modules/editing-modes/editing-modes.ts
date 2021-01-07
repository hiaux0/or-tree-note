import { logger } from "../debug/logger";
import { AbstractMode } from "./abstract-mode";
import {
  CURSOR_UP,
  CURSOR_DOWN,
  INSERT_MODE,
} from "./../../resources/keybindings/app.keys";
import {
  COMMAND_PALETT,
  CURSOR_LEFT,
  CURSOR_RIGHT,
  ESCAPE,
} from "../../resources/keybindings/app.keys";
import { getCssVar, getValueFromPixelString } from "../css/css-variables";
import hotkeys from "hotkeys-js";
import { NormalMode } from "./normal-mode/normal-mode";
import { InsertMode } from "./insert-mode/insert-mode";
import { NormalModeKeybindings } from "./normal-mode/normal-mode-commands";
import keyBindingsJson from "../../resources/keybindings/key-bindings.json";
import { InsertModeKeybindings } from "./insert-mode/insert-mode-commands";

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
  normal: NormalModeKeybindings[];
  insert: InsertModeKeybindings[]; // TODO to instert
}

const keyBindings = (keyBindingsJson as unknown) as KeyBindingModes;

export class EditingModes {
  // currentModeName: EditorModes = EditorModes.INSERT;
  currentModeName: EditorModes = EditorModes.INSERT;
  normalMode: NormalMode;
  insertMode: InsertMode;
  modes: { [key: string]: AbstractMode };

  constructor(
    private parentElement: HTMLElement,
    private childSelector: string,
    private caretElement: HTMLElement
  ) {
    this.normalMode = new NormalMode(
      this.parentElement,
      this.childSelector,
      this.caretElement
    );

    this.insertMode = new InsertMode(
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
    this.modes[EditorModes.INSERT] = this.insertMode;

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "l" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "x" }));
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

  keyPressed(pressedKey: string) {
    const curMode = this.currentModeName.toLocaleLowerCase();
    const targetCommand = keyBindings[curMode].find(
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

    return this.getCurrentMode()[targetCommand.command](pressedKey);
  }

  initKeys() {
    hotkeys("*", (ev) => {
      logger.debug(["--- Key pressed: %s", ev.key]);

      if (ev.key === INSERT_MODE) {
        logger.debug("Enter Insert mode");

        this.currentModeName = EditorModes.INSERT;
        this.caretElement.classList.remove(CARET_NORMAL_CLASS);
        this.caretElement.classList.add(CARET_INSERT_CLASS);
        return;
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
