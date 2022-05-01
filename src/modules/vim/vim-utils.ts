import {
  VimCommandNames,
  VIM_COMMAND,
  VIM_COMMANDS,
  VIM_MODE_COMMANDS,
} from './vim-commands-repository';

export function isModeChangeCommand(command: VIM_COMMAND) {
  return VIM_MODE_COMMANDS.includes(command);
}
