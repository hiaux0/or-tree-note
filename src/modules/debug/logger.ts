const debugMode = true;

interface LogOptions {
  logMethod?: "log" | "trace" | "error";
  log?: boolean;
  /**
   * Even in debug mode, only log, when explicitely set via `log`.
   */
  focusedLogging?: boolean;
}

const defautLogOptions: LogOptions = {
  logMethod: "log",
  focusedLogging: true,
};

export class Logger {
  constructor(private globalLogOptions: LogOptions = defautLogOptions) {}

  debug(messages: any | string[], logOptions?: LogOptions) {
    if (debugMode) {
      const logOpt = {
        ...this.globalLogOptions,
        ...logOptions,
      };

      if (this.globalLogOptions.focusedLogging && !logOptions?.log) {
        return;
      }

      if (Array.isArray(messages)) {
        console[logOpt.logMethod](...messages);
        return;
      }

      console[logOpt.logMethod](messages);
    }
  }
}

export const logger = new Logger(defautLogOptions);
