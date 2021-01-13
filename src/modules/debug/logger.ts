const debugMode = true;

interface LogOptions {
  /////////////// Log
  logMethod?: "log" | "trace" | "error" | "group" | "groupEnd";
  log?: boolean;
  logLevel?: "info" | "verbose";
  onlyVerbose?: boolean;
  /**
   * TODO
   * Don't use console.log(obj), use console.log(JSON.parse(JSON.stringify(obj))).
   */
  deepLogObjects?: boolean;
  /**
   * Unless specified by `expandGroupBasedOnString`
   * TODO: `expandGroupBasedOnString` could be renamed to sth more suitable
   */
  dontLogUnlessSpecified?: boolean;
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
  // dontLogUnlessSpecified: true,
  focusedLogging: false,
  useTable: true,
  // allGroupsCollapsedButSpecified: true,
  // expandGroupBasedOnString: "h",
  throwOnError: true,
};

interface BugLogOptions {
  isStart?: boolean;
  isEnd?: boolean;
  //
  color?: string;
}

const groupId: string[] = [];
let bugGroupId: string[] = [];

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

      const onlyFocusedLogging = logOpt.focusedLogging && !logOpt?.log;
      if (onlyFocusedLogging) {
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
      const isExpandGroupBasedOnString = placeholderValues.includes(
        logOpt.expandGroupBasedOnString
      );

      if (logOpt.dontLogUnlessSpecified) {
        //
        // if (!logOpt.expandGroupBasedOnString) {
        //   console.warn("Pleace specifiy `expandGroupBasedOnString`");
        // }

        //
        const onlyLogBasedOnString = isExpandGroupBasedOnString;

        if (!onlyLogBasedOnString) {
          return;
        }
      }

      //
      if (logOpt.startGroupId) {
        if (logOpt.allGroupsCollapsedButSpecified) {
          if (!logOpt.expandGroupBasedOnString) {
            console.warn("Pleace specifiy `expandGroupBasedOnString`");
          }

          if (isExpandGroupBasedOnString) {
            console.group();
          } else {
            console[logOpt.logMethod](...messageWithLogScope);
            console.groupCollapsed();
          }
          //
        } else {
          console[logOpt.logMethod](...messageWithLogScope);
          console.group();
        }
        groupId.push(logOpt.startGroupId);
      }

      //
      console[logOpt.logMethod](...messageWithLogScope);

      if (logOpt.endGroupId === groupId[0]) {
        console.groupEnd();
      }

      //
      if (logOpt.useTable) {
        if (Array.isArray(messageWithLogScope[1])) {
          console.table(messageWithLogScope[1]);
        }
      }
    }
  }

  bug(message: string, logOptions: BugLogOptions = {}) {
    //
    if (logOptions.isStart) {
      console.group(message);

      bugGroupId.push(message);
    }

    //
    const isEnd =
      logOptions.isEnd && message === bugGroupId[bugGroupId.length - 1];
    if (isEnd) {
      console.groupEnd();
      bugGroupId = bugGroupId.slice(0, bugGroupId.length - 1);
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
