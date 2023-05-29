import { VIM_COMMAND, VIM_MODE_COMMANDS } from './vim-commands-repository';

export function isModeChangeCommand(command: VIM_COMMAND) {
  const is = VIM_MODE_COMMANDS.includes(command);
  return is;
}
