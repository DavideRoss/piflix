import { injectable } from 'inversify';

import * as passport from 'passport';

import { RequestSessionHandler } from 'api/request-session-handler';

@injectable()
export class UserController {
    login(req: RequestSessionHandler, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }

            if (info) {
                if (info.message === 'Missing credentials') {
                    return next({
                        status: 401
                    });
                }

                return next(info);
            }

            if (!user) {
                return next({
                    status: 401
                });
            }

            res.send(user);
        })(req, res, next);
    }

    logout(req, res) {

    }
}