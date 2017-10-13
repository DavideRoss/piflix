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

// TODO: move to appropriate API call
// import { User, UserRole } from 'models/user.model';
// import { hashPassword } from 'utils/crypt';

// (async () => {
//     let u = new User({
//         mail: 'davide.ross93@gmail.com',
//         password: hashPassword('davide12'),
//         activated: true,
//         role: UserRole.administrator
//     });

//     await u.save();
//     console.log(u);
// })();