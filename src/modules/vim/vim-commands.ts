import { ModifiersType } from "./../../resources/keybindings/app.keys";
import keyBindings from '../../resources/keybindings/key-bindings';

export const VIM_COMMANDS = keyBindings.normal.map(normalBinding => normalBinding.command);

export type VimCommandNames = typeof VIM_COMMANDS[number];

export interface VimCommand {
  key: string;
  command: VimCommandNames;
}

export interface SynonymKey {
  [key: string]: ModifiersType;
}
