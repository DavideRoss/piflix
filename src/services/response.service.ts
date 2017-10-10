import { injectable } from 'inversify';

import { Configuration } from 'core/config';
import { Logger } from 'core/log';
import { ApiError } from 'core/error-codes';

export interface ErrorResponseBody {
    message: any;
    stack?: any;
    code?: number;
}

@injectable()
export class ResponseService {
    constructor(
        private _logger: Logger,
        private _config: Configuration
    ) { }

    errorMiddleware(err, req, res, next) {
        let status: number = 500;
        let responseBody: ErrorResponseBody;

        if (err instanceof ApiError) {
            responseBody = {
                message: err.errorCodeObject.message,
                code: err.errorCodeObject.code,
                stack: err.stack
            };

            status = err.errorCodeObject.status;
        } else if (err.name === 'ValidationError') {
            responseBody = {
                message: {
                    errors: err.details.map(e => {
                        return {
                            type: e.type,
                            label: e.context.label
                        };
                    })
                },
                code: 1999
            };

            status = 400;
        } else if (err instanceof Error) {
            responseBody = {
                message: err.message,
                stack: err.stack
            };
        } else {
            responseBody = {
                message: err
            };
        }

        if (status === 400) {
            return this.badRequest(responseBody, req, res, next);
        }

        if (status === 401) {
            return this.unauthorized(responseBody, req, res, next);
        }

        if (status === 403) {
            return this.forbidden(responseBody, req, res, next);
        }

        if (status === 404) {
            return this.notFount(responseBody, req, res, next);
        }

        this.serverError(responseBody, req, res, next);
    }

    serverError(err: ErrorResponseBody, req, res, next) {
        if (!this._config.debug.sendErrorsToClient) {
            return res.status(500).send();
        }

        res.status(500).send({
            message: err.message,
            code: err.code,
            stack: this._config.debug.sendStackToClient ? err.stack : undefined
        });

        this._logger.error(err);
        process.exit(1);
    }

    badRequest(err, req, res, next) {
        res.status(400).send({
            message: err.message,
            code: err.code,
            stack: this._config.debug.sendStackToClient ? err.stack : undefined
        });
    }

    forbidden(err, req, res, next) {
        res.status(403).send({
            message: err.message,
            code: err.code,
            stack: this._config.debug.sendStackToClient ? err.stack : undefined
        });
    }

    unauthorized(err, req, res, next) {
        res.status(401).send({
            message: err.message,
            code: err.code,
            stack: this._config.debug.sendStackToClient ? err.stack : undefined
        });
    }

    notFount(err, req, res, next) {
        res.status(404).send();
    }
}