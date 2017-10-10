import { injectable } from 'inversify';

import { Configuration } from 'core/config';
import { Db } from 'core/db';

import { UserInstance } from 'models/user.model';
import { TokenInstance, TokenLevel } from 'models/token.model';

import * as cryptUtils from 'utils/crypt';

@injectable()
export class AuthService {
    constructor(
        private _db: Db,
        private _config: Configuration
    ) { }

    /**
     * Create a new random access token on database
     *
     * @param {UserInstance} user User to whom the token will be assigned
     * @param {number} expiration Expiration time in seconds
     * @param {number} level Token level (phase of account state)
     * @returns {Promise<TokenInstance>} Instance of the saved token
     * @memberof AuthService
     */
    async createToken(user: UserInstance, expiration: number, level: TokenLevel): Promise<TokenInstance> {
        let expireAt = new Date();
        expireAt.setTime(expireAt.getTime() + expiration * 1000);

        let token = new this._db.models.Token({
            user: user._id,
            value: cryptUtils.uuid(16),
            expireAt,
            level
        });

        return await token.save();
    }
}