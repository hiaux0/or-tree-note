import { Logger as Culogger, LogOptions } from '../../modules/debug/logger';

interface ILogOptions extends LogOptions {
  log?: boolean;
  focusedLogging?: boolean;

  measurePerf?: boolean;
  focusedPerf?: boolean;
  logPerf?: boolean;

  /**
   * Indicate to, that log can/should perform a reset
   */
  reset?: boolean;
  highlight?: boolean;
}

const DEFAULT_LOG_OPTIONS: ILogOptions = {
  log: false,
  focusedLogging: true,
  measurePerf: false,
  focusedPerf: true,
  logPerf: false,
  reset: false,
};

export class Logger {
  public readonly culogger: Culogger;

  constructor(
    scope: string = 'Aurelia',
    private readonly options: ILogOptions = DEFAULT_LOG_OPTIONS
  ) {
    this.culogger = new Culogger({ scope });
    this.culogger.overwriteDefaultLogOtpions({
      // log,
      logLevel: 'INFO',
      focusedLogging: true,
      // logScope: false,
    });
  }

  log(message: string, options?: ILogOptions) {
    /**
     * Wallaby logic.
     * Wallaby does not console.log from external library.
     */
    this.logMessage(message, options);
  }

  private logMessage(
    message: string,
    options: ILogOptions = DEFAULT_LOG_OPTIONS
  ) {
    const { log } = options;
    const loggedMessage = this.culogger.debug([message], {
      logLevel: 'INFO',
      log,
    });
    if (loggedMessage) {
      console.log(loggedMessage[0]);
      if (loggedMessage.length > 1) {
        console.log('There are more log messages');
      }
    }
  }
}
