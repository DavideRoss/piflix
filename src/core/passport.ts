import { injectable } from 'inversify';

import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';

import { Configuration } from 'core/config';
import { Db } from 'core/db';
import { ApiError, ErrorCode } from 'core/error-codes';

import { AuthService } from 'services/auth.service';

import { TokenLevel } from 'models/token.model';
import { UserInstance } from 'models/user.model';

import * as passport from 'passport';
import * as bcrypt from 'bcrypt';

@injectable()
export class PassportConfiguration {
    constructor(
        private _config: Configuration,
        private _db: Db,
        private _authService: AuthService
    ) { }

    initStrategies() {
        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((id, done) => {
            this._db.models.User.findOne({
                id: id
            }).exec(done);
        });

        passport.use(new LocalStrategy({
            usernameField: 'mail',
            passwordField: 'password'
        }, async (mail, password, done) => {
            if (!mail || !password) {
                return done(null, false);
            }

            try {
                let user = await this._db.models.User.findOne({
                    mail: mail
                });

                if (!user) {
                    throw new ApiError(ErrorCode.user_not_found);
                }

                if (!bcrypt.compareSync(password, user.password)) {
                    throw new ApiError(ErrorCode.user_invalid_password);
                }

                if (!user.activated) {
                    throw new ApiError(ErrorCode.user_not_activated);
                }

                let expiration = this._config.token.expiration;
                let token = await this._authService.createToken(user, expiration, TokenLevel.activation);

                user.token = token.value;
                return done(null, user);
            } catch (err) {
                done(err, null);
            }
        }));

        passport.use(new BearerStrategy(async (accessToken, done) => {
            let token = await this._db.models.Token.findOne({
                value: accessToken,
                expireAt: {
                    $gt: new Date()
                },
                level: TokenLevel.authenticate
            }).populate('user');

            if (!token || !token.user) {
                return done(null, false);
            }

            let user = <UserInstance>token.user;
            user.token = token.value;

            done(null, user);
        }));

        // TODO: integrate bearer-reset-password strategy
        // TODO: integrate bearer-user-activation strategy
    }
}