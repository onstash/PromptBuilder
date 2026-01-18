type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

interface LoggerConfig {
  namespace: string;
  level: LogLevel;
  enableConsoleLog: boolean;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

export class Logger {
  private namespace: string;
  private level: LogLevel;
  private enableConsoleLog: boolean;

  private constructor(config: LoggerConfig) {
    this.namespace = config.namespace;
    this.level = config.level;
    this.enableConsoleLog = config.enableConsoleLog;
  }

  static createLogger(config: LoggerConfig): Logger {
    return new Logger(config);
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[messageLevel] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private formatMessage(level: LogLevel, message: unknown): string {
    const timestamp = new Date().toISOString();
    const serialized = typeof message === "string" ? message : JSON.stringify(message, null, 2);

    return `[${timestamp}] [${level}] [${this.namespace}] ${serialized}`;
  }

  private log(level: LogLevel, message: unknown): void {
    if (!this.enableConsoleLog || !this.shouldLog(level)) return;

    try {
      const formatted = this.formatMessage(level, message);

      switch (level) {
        case "DEBUG":
        case "INFO":
          console.log(formatted);
          break;
        case "WARN":
          console.warn(formatted);
          break;
        case "ERROR":
          console.error(formatted);
          break;
      }
    } catch (err: unknown) {
      // console.error("Logger error:", err);
    }
  }

  debug(...message: unknown[]): void {
    this.log("DEBUG", message);
  }

  info(...message: unknown[]): void {
    this.log("INFO", message);
  }

  warn(...message: unknown[]): void {
    this.log("WARN", message);
  }

  error(...message: unknown[]): void {
    this.log("ERROR", message);
  }
}
