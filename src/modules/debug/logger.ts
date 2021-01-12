const debugMode = true;

interface LogOptions {
  /////////////// Log
  logMethod?: "log" | "trace" | "error" | "group" | "groupEnd";
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
  useTable?: boolean;
  /////////////// Grouping
  startGroupId?: string;
  endGroupId?: string;
  /** Specified by `expandGroupBasedOnString` */
  allGroupsCollapsedButSpecified?: boolean;
  expandGroupBasedOnString?: string;
}

const defautLogOptions: LogOptions = {
  logMethod: "log",
  logLevel: "verbose",
  focusedLogging: false,
  useTable: true,
  allGroupsCollapsedButSpecified: true,
  expandGroupBasedOnString: "b",
  throwOnError: true,
};

const groupId: string[] = [];

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
      if (logOpt.startGroupId) {
        const isExpandGroupBasedOnString = placeholderValues.includes(
          logOpt.expandGroupBasedOnString
        );
        const onlyExpandSpecified =
          logOpt.allGroupsCollapsedButSpecified && isExpandGroupBasedOnString;

        if (onlyExpandSpecified) {
          console.group();
        } else {
          console.groupCollapsed();
        }
        groupId.push(logOpt.startGroupId);
      } else if (logOpt.endGroupId === groupId[0]) {
        console.groupEnd();
      }

      //
      console[logOpt.logMethod](...messageWithLogScope);

      //
      if (logOpt.useTable) {
        if (Array.isArray(messageWithLogScope[1])) {
          console.table(messageWithLogScope[1]);
        }
      }
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
