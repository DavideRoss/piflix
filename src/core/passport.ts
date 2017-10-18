import { injectable } from 'inversify';

import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as LocalStrategy } from 'passport-local';

import { Configuration } from 'core/config';
import { ApiError, ErrorCode } from 'core/error-codes';

import { AuthService } from 'services/auth.service';

import { TokenLevel } from 'interfaces/token.interface';
import { IUser } from 'interfaces/user.interface';

import { Token } from 'models/token.model';
import { User } from 'models/user.model';

import * as bcrypt from 'bcrypt';
import * as passport from 'passport';

@injectable()
export class PassportConfiguration {
    constructor(
        private _config: Configuration,
        private _authService: AuthService
    ) { }

    initStrategies() {
        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((id, done) => {
            User.findOne({ id }).exec(done);
        });

        passport.use(new LocalStrategy({
            passwordField: 'password',
            usernameField: 'mail'
        }, async (mail, password, done) => {
            if (!mail || !password) {
                return done(null, false);
            }

            try {
                const user = await User.findOne({ mail });

                if (!user) {
                    throw new ApiError(ErrorCode.user_not_found);
                }

                if (!bcrypt.compareSync(password, user.password)) {
                    throw new ApiError(ErrorCode.user_invalid_password);
                }

                const expiration = this._config.token.expiration;
                const token = await this._authService.createToken(user, expiration, TokenLevel.authenticate);

                user.token = token.value;
                return done(null, user);
            } catch (err) {
                done(err, null);
            }
        }));

        passport.use(new BearerStrategy(async (accessToken, done) => {
            const token = await Token.findOne({
                expireAt: {
                    $gt: new Date()
                },
                level: TokenLevel.authenticate,
                value: accessToken
            }).populate('user');

            if (!token || !token.user) {
                return done(null, false);
            }

            const user = token.user as IUser;
            user.token = token.value;

            done(null, user);
        }));

        // TODO: integrate bearer-reset-password strategy
        // TODO: integrate bearer-user-activation strategy
    }
}
