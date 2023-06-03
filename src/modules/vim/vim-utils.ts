import { VIM_COMMAND, VIM_MODE_COMMANDS } from './vim-commands-repository';
import { VimMode } from './vim-types';

export function isModeChangeCommand(
  command: VIM_COMMAND,
  currentMode?: VimMode,
  newMode?: VimMode
) {
  const same = currentMode === newMode;
  if (same) return false;

  const is = VIM_MODE_COMMANDS.includes(command);
  return is;
}
