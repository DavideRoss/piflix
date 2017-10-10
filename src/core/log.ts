import { injectable } from 'inversify';
import { Configuration } from 'core/config';

import * as express from 'express';
import * as winston from 'winston';
import * as winstonCommon from 'winston/lib/winston/common';
import * as expressWinston from 'express-winston';
import * as dateFormat from 'dateformat';

interface LogConfiguration {
    level: string;
}

@injectable()
export class Logger {
    log: winston.LoggerInstance;
    transports: winston.TransportInstance[] = [];

    constructor(private _config: Configuration) {
        winston.transports.Console.prototype.log = function(level, message, meta, callback) {
            const output = winstonCommon.log(Object.assign({}, this, {
                level, message, meta
            }));

            console[level in console ? level : 'log'](output);
            setImmediate(callback, null, true);
        };

        if (process.env.PC_SILENT !== 'true') {
            this.transports.push(new winston.transports.Console({
                json: false,
                colorize: true,
                useTimestamp: this._config.log.level,
                stderrLevels: ['error'],
                timestamp: (this._config.log.timestamp) ? () => {
                    return (<any>winston).config.colorize('data', dateFormat(new Date(), 'isoDateTime'));
                } : false
            }));
        }

        this.log = new winston.Logger({
            level: this._config.log.level,
            transports: this.transports
        });

        this.log.info(`Logger: log level ${this._config.log.level}`);
    }

    error(message) {
        return this.log.error(message);
    }

    debug(message) {
        return this.log.debug(message);
    }

    info(message) {
        return this.log.log('info', message);
    }

    silly(message) {
        return this.log.log('silly', message);
    }

    setupApp(app: express.Application) {
        if (this._config.log.http) {
            app.use(expressWinston.logger({
                winstonInstance: this.log,
                meta: false,
                msg: '{{req.method}} {{req.url}} {{res.responseTime}}ms {{res.statusCode}}',
                colorize: true
            }));
        }
    }
}