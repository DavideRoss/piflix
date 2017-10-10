import { injectable } from 'inversify';

import * as passport from 'passport';

@injectable()
export class Policy {
    isAuthenticated(req, res): Promise<any> {
        return new Promise((resolve, reject) => {
            passport.authenticate('bearer')(req, res, () => {
                resolve();
            });
        });
    }
}