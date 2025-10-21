/**
 * Logger Utility - Namespaced logging with multiple severity levels
 *
 * Provides structured logging using the 'debug' library with namespace support.
 * Each logger instance is scoped to a specific component or module.
 *
 * @example
 * const logger = new Logger('DataHandler');
 * logger.info('Processing tweets', count);
 * logger.error('Failed to load archive', error);
 */

import debug from "debug";

/**
 * Creates a namespaced logger instance
 * @class
 */
export default class Logger {
  /**
   * @param {string} namespace - Logger namespace (e.g., 'DataHandler', 'TweetProcessor')
   */
  constructor(namespace) {
    this.loggers = {
      debug: debug(`app:${namespace}`),
      info: debug(`app:${namespace}`),
      warn: debug(`app:${namespace}`),
      error: debug(`app:${namespace}`),
    };

    this.loggers.debug.log = console.debug.bind(console);
    this.loggers.info.log = console.info.bind(console);
    this.loggers.warn.log = console.warn.bind(console);
    this.loggers.error.log = console.error.bind(console);
  }

  /**
   * Log trace-level message (alias for debug)
   * @param {...any} args - Values to log
   */
  trace(...args) {
    this.debug(args);
  }

  /**
   * Log debug-level message
   * @param {...any} args - Values to log
   */
  debug(...args) {
    this.loggers.debug.apply(null, ["DEBUG", ...args]);
  }

  /**
   * Log info-level message
   * @param {...any} args - Values to log
   */
  info(...args) {
    this.loggers.info.apply(null, ["INFO", ...args]);
  }

  /**
   * Log message (alias for info)
   * @param {...any} args - Values to log
   */
  log(...args) {
    this.info(args);
  }

  /**
   * Log warning-level message
   * @param {...any} args - Values to log
   */
  warn(...args) {
    this.loggers.warn.apply(null, ["WARN", ...args]);
  }

  /**
   * Log error-level message
   * @param {...any} args - Values to log
   */
  error(...args) {
    this.loggers.error.apply(null, ["ERROR", ...args]);
  }
}
