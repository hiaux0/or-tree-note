import { AbstractTextMode } from './abstract-text-mode';
import { VimState } from 'modules/vim/vim.types';
import { Logger } from 'modules/debug/logger';
import { changeText } from '../actions/actions-vim-editor';

const logger = new Logger({ scope: 'VisualTextMode' });

export class VisualTextMode extends AbstractTextMode {
}
