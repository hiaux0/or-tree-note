const debugMode = true;

interface LogOptions {
  /////////////// Log
  logMethod?: "log" | "trace" | "error";
  log?: boolean;
  logLevel?: "info" | "verbose";
  onlyVerbose?: boolean;
  /**
   * Even in debug mode, only log, when explicitely set via `log`.
   */
  focusedLogging?: boolean;
  /////////////// Error
  throwOnError?: boolean;
  /** Mark a logger as error */
  isError?: boolean;
  /////////////// Custom output
  /** */
  scope?: string;
  prefix?: number;
}

const defautLogOptions: LogOptions = {
  logMethod: "log",
  logLevel: "verbose",
  focusedLogging: false,
  throwOnError: true,
};

export class Logger {
  constructor(private globalLogOptions: LogOptions) {}

  debug(messages: [string, ...any[]], logOptions?: LogOptions) {
    if (debugMode) {
      const logOpt = {
        ...this.globalLogOptions,
        ...defautLogOptions,
        ...logOptions,
      };

      //
      /** === false, because it is explicitly set */
      if (logOpt.log === false) {
        return;
      }

      if (this.globalLogOptions.focusedLogging && !logOptions?.log) {
        return;
      }

      //
      const [withSubstitutions, ...placeholderValues] = messages;
      let updatedSubstitutions = `[${logOpt.scope}] ${withSubstitutions}`;

      if (logOpt.prefix) {
        updatedSubstitutions = `- (${logOpt.prefix}.) - ${updatedSubstitutions}`;
      }

      const messageWithLogScope = [updatedSubstitutions, ...placeholderValues];

      //
      if (logOpt.throwOnError && logOpt.isError) {
        /**
         * We console.error AND throw, because we want to keep the formatting of the console.**
         */
        console.error(...messageWithLogScope);
        throw "ERROR";
      }

      if (logOpt.logLevel !== "verbose" && logOpt.onlyVerbose) {
        return;
      }

      //
      console[logOpt.logMethod](...messageWithLogScope);
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
