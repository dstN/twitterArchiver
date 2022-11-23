import debug from 'debug';

export default class Logger {
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

    trace(...args) {
        this.debug(args);
    }

    debug(...args) {
        this.loggers.debug.apply(null, ['DEBUG', ...args]);
    }

    info(...args) {
        this.loggers.info.apply(null, ['INFO', ...args]);
    }

    log(...args) {
        this.info(args);
    }

    warn(...args) {
        this.loggers.warn.apply(null, ['WARN', ...args]);
    }

    error(...args) {
        this.loggers.error.apply(null, ['ERROR', ...args]);
    }
}