import { VimMode } from "../vim";
import { AbstractMode } from "./abstract-mode";

export class NormalMode extends AbstractMode {
  currentMode = VimMode.NORMAL;

  executeCommand(commandName: string, commandValue: string) {
    return super.executeCommand(commandName, commandValue, this.currentMode);
  }
}
