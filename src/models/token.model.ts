import * as mongoose from 'mongoose';

import { IToken, ITokenModel, TokenLevel } from 'interfaces/token.interface';
import { IUser } from 'interfaces/user.interface';

export class TokenSchema extends mongoose.Schema implements IToken {
    value?: string;
    expireAt?: Date;
    level?: TokenLevel;
    user?: IUser;

    constructor() {
        super({
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },

            value: {
                type: String,
                required: true
            },

            expireAt: {
                type: Date,
                required: true
            },

            level: {
                type: Number,
                required: true
            }
        });
    }
}

export const Token = mongoose.model<ITokenModel>('Token', new TokenSchema());
