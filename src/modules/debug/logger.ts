const debugMode = true;

interface LogOptions {
  logMethod?: "log" | "trace" | "error";
  log?: boolean;
  /**
   * Even in debug mode, only log, when explicitely set via `log`.
   */
  focusedLogging?: boolean;
  throwOnFirstError?: boolean;
}

const defautLogOptions: LogOptions = {
  logMethod: "log",
  focusedLogging: false,
  throwOnFirstError: false,
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
        if (logOpt.throwOnFirstError) {
          messages.forEach((message) => {
            if (!message) {
              console.log(...messages);
              throw message;
            }
          });
        }

        console[logOpt.logMethod](...messages);
        return;
      }

      console[logOpt.logMethod](messages);
    }
  }
}

export const logger = new Logger(defautLogOptions);

/**
 * - [x?] Throw on first error
 *   - is this part of a logger?
 *   - some other debugging mode then?
 *
 * - colorize logs
 *
 * - [ ] only log based on given error codes
 * - [ ] discard "old logs"
 *   - requires separate log files for when a log was added
 */
