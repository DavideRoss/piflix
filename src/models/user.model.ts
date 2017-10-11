import * as mongoose from 'mongoose';

import { IUser, IUserModel } from 'interfaces/user.interface';

export class UserSchema extends mongoose.Schema implements IUser {
    mail: string;
    password: string;
    token: string;
    activated: boolean;

    constructor() {
        super({
            mail: {
                type: String,
                required: true
            },

            password: {
                type: String,
                required: true
            },

            token: String,
            activated: {
                type: Boolean,
                default: false
            }
        });
    }
}

export const User = mongoose.model<IUserModel>('User', new UserSchema());
