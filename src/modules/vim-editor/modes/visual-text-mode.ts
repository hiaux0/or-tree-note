import { Logger } from 'modules/debug/logger';

import { AbstractTextMode } from './abstract-text-mode';

const logger = new Logger({ scope: 'VisualTextMode' });

export class VisualTextMode extends AbstractTextMode {
}
