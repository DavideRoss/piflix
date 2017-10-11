import { injectable } from 'inversify';

import { Configuration } from 'core/config';
import { Db } from 'core/db';

import { IUserModel } from 'interfaces/user.interface';
import { TokenLevel, ITokenModel } from 'interfaces/token.interface';

import { User } from 'models/user.model';
import { Token } from 'models/token.model';

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
     * @param {IUserModel} user User to whom the token will be assigned
     * @param {number} expiration Expiration time in seconds
     * @param {number} level Token level (phase of account state)
     * @returns {Promise<ITokenModel>} Instance of the saved token
     * @memberof AuthService
     */
    async createToken(user: IUserModel, expiration: number, level: TokenLevel): Promise<ITokenModel> {
        let expireAt = new Date();
        expireAt.setTime(expireAt.getTime() + expiration * 1000);

        let token = new Token({
            user: user._id,
            value: cryptUtils.uuid(16),
            expireAt,
            level
        });

        return await token.save();
    }
}