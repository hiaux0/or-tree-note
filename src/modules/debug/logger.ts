const debugMode = true;

/**
 * TODO: WARNING and ERROR mean sth else in other loggers, but here
 * it's just a "higher level"
 */
type LogLevel = 'INFO' | 'DEBUG' | 'VERBOSE' | 'WARNING' | 'ERROR';

export interface LogOptions {
  /// //////////// Log
  disableLogger?: boolean;
  /**
   * Todo: Remove this for explicit methods
   * Reason: quokka output
   */
  log?: boolean;
  logLevel?: LogLevel;
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
  /// //////////// Error
  throwOnError?: boolean;
  /** Mark a logger as error */
  isError?: boolean;
  /// //////////// Custom output
  /** */
  scope?: string;
  prefix?: number;
  useTable?: boolean;
  /// //////////// Grouping
  startGroupId?: string;
  endGroupId?: string;
  /** Only in the sense of "just one" */
  isOnlyGroup?: boolean;
  clearPreviousGroupsWhen_isOnlyGroup_True?: boolean;
  /** Specified by `expandGroupBasedOnString` */
  allGroupsCollapsedButSpecified?: boolean;
  expandGroupBasedOnString?: string;
}

let defautLogOptions: LogOptions = {
  logLevel: 'VERBOSE',
  clearPreviousGroupsWhen_isOnlyGroup_True: true,
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
  index?: number;
  debugger?: boolean;
}

const LogLevelMap = {
  INFO: 0,
  DEBUG: 1,
  VERBOSE: 2,
  WARNING: 3,
  ERROR: 4,
};

function isAllowedLogLevel(logOptions: LogOptions) {
  const isAllowed =
    LogLevelMap[logOptions.logLevel] <= LogLevelMap[defautLogOptions.logLevel];

  return isAllowed;
}

const loggerDevelopmentDebugLog: string[][] = [];
const groupId: string[] = [];
let onlyGroup: string[] = [];
let bugGroupId: string[] = [];

export class Logger {
  private readonly logTrail: unknown[] = [];
  public getLogTrail() {
    return this.logTrail;
  }

  constructor(private globalLogOptions: LogOptions) {}

  public setLogOptions(logOptions: LogOptions) {
    this.globalLogOptions = {
      ...this.globalLogOptions,
      ...logOptions,
    };
  }

  public overwriteDefaultLogOtpions(logOptions: LogOptions) {
    defautLogOptions = {
      ...defautLogOptions,
      ...logOptions,
    };
  }

  public setScope(scopeName: string): void {
    this.globalLogOptions.scope = scopeName;
  }

  public enableBrowserDevelopmentLogging(): void {
    if (window) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (window as unknown).loggerDevelopmentDebugLog = loggerDevelopmentDebugLog;
    }
  }

  /**
   * 1. Setup
   * 2. ">>> Actual Log"
   */
  public debug(
    messages: [string, ...unknown[]],
    logOptions?: LogOptions,
    callback?: (...message: unknown[]) => void
  ): unknown[] {
    if (!debugMode) return;

    const logOpt = {
      ...defautLogOptions,
      ...this.globalLogOptions,
      ...logOptions,
    };

    if (logOpt.disableLogger === true) return;
    if (!isAllowedLogLevel(logOpt)) return;

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
    const [withSubstitutions] = messages;
    let [, ...placeholderValues] = messages;
    let updatedSubstitutions = `[${logOpt.scope ?? ''}] ${withSubstitutions}`;

    if (logOpt.prefix) {
      updatedSubstitutions = `- (${logOpt.prefix}.) - ${updatedSubstitutions}`;
    }

    //
    if (logOpt.deepLogObjects) {
      placeholderValues = placeholderValues.map((value) =>
        JSON.stringify(value)
      );
    }

    const messageWithLogScope = [
      updatedSubstitutions,
      ...placeholderValues,
    ] as string[];

    //
    if (logOpt.throwOnError && logOpt.isError) {
      /**
       * We console.error AND throw, because we want to keep the formatting of the console.**
       */
      console.error(...messageWithLogScope);
      throw new Error('!!! [[ERROR]] Check above message !!!');
    }

    if (logOpt.logLevel !== 'VERBOSE' && logOpt.onlyVerbose) {
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
          console.warn('Pleace specifiy `expandGroupBasedOnString`');
        }

        if (isExpandGroupBasedOnString) {
          console.group();
        } else {
          console.log(...messageWithLogScope);
          console.groupCollapsed();
        }
        //
      } else {
        console.log(...messageWithLogScope);
        console.group();
      }
      groupId.push(logOpt.startGroupId);
    }

    //
    if (logOpt.isOnlyGroup) {
      if (logOpt.clearPreviousGroupsWhen_isOnlyGroup_True) {
        console.clear();
      }

      if (onlyGroup.length === 0) {
        onlyGroup.push(messageWithLogScope[0]);
        console.group(...messageWithLogScope);
        loggerDevelopmentDebugLog.push(['group', ...messageWithLogScope]);
      } else {
        onlyGroup = [];
        console.groupEnd();
        loggerDevelopmentDebugLog.push(['groupEnd', ...messageWithLogScope]);
        console.group(...messageWithLogScope);
        onlyGroup.push(messageWithLogScope[0]);
        loggerDevelopmentDebugLog.push(['group', ...messageWithLogScope]);
      }
    }
    // >>> Actual log
    if (callback) {
      callback(...messageWithLogScope);
    } else {
      console.log(...messageWithLogScope);
    }
    this.logTrail.push(messageWithLogScope);
    loggerDevelopmentDebugLog.push(['log', ...messageWithLogScope]);

    if (logOpt.endGroupId !== undefined && logOpt.endGroupId === groupId[0]) {
      console.groupEnd();
    }

    //
    if (logOpt.useTable) {
      if (Array.isArray(messageWithLogScope[1])) {
        console.table(messageWithLogScope[1]);
      }
    }

    return messageWithLogScope;
  }

  public bug(message: string, logOptions: BugLogOptions = {}): string {
    if (!debugMode) return;

    //
    if (logOptions.isStart) {
      console.group(message);

      bugGroupId.push(message);
    }

    let finalMessage: string;
    if (logOptions.index) {
      finalMessage = `[(${logOptions.index})]: ${message}`;
    } else {
      finalMessage = message;
    }

    //
    console.log(
      `%c ${finalMessage}`,
      `background: ${logOptions.color ?? 'blue'}`
    );

    //
    const isEnd =
      logOptions.isEnd && message === bugGroupId[bugGroupId.length - 1];
    if (isEnd) {
      console.groupEnd();
      bugGroupId = bugGroupId.slice(0, bugGroupId.length - 1);
    }

    //
    if (logOptions.debugger) {
      // eslint-disable-next-line no-debugger
      debugger;
    }

    return finalMessage;
  }

  public todo(message: string): string {
    const todoMessage = `>>>> [TODO]: %c${message}`;
    console.log(todoMessage, `background: ${'darkgreen'}`);

    return todoMessage;
  }
}

export const logger = new Logger(defautLogOptions);

// export const testLogger = new Logger({
//   scope: 'Test',
//   // log: false,
// });
// testLogger.debug(['first']);
// testLogger.debug(['another'], { log: true });

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
