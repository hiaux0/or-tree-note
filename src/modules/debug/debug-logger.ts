const debugMode = true;

interface LogOptions {
  logMethod: "log" | "trace" | "error";
}

const defautLogOptions: LogOptions = {
  logMethod: "log",
};

export class Logger {
  constructor(private logOptions: LogOptions = defautLogOptions) {}

  debug(messages: string | string[], logOptions?: LogOptions) {
    if (debugMode) {
      const logMethod = (logOptions || this.logOptions).logMethod;

      if (Array.isArray(messages)) {
        console[logMethod](...messages);
        return;
      }

      console[logMethod](messages);
    }
  }
}

export const logger = new Logger(defautLogOptions);
