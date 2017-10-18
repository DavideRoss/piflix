import { injectable } from 'inversify';

import * as isReachable from 'is-reachable';

import { Configuration } from 'core/config';
import { ApiError, ErrorCode } from 'core/error-codes';

@injectable()
export class ExternalService {
    constructor(
        private _config: Configuration
    ) { }

    checkStatus(req, res, next) {
        isReachable(this._config.external.api).then((reachable) => {
            // TODO: refactor for throwing instead of calling next with error argument
            if (reachable) {
                next();
            } else {
                next(new ApiError(ErrorCode.missing_external_api_connectivity));
            }
        });
    }
}
