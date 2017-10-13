import * as mongoose from 'mongoose';

import { IUser, IUserModel } from 'interfaces/user.interface';

export enum UserRole {
    administrator = 0,
    user = 1
}

export class UserSchema extends mongoose.Schema implements IUser {
    mail: string;
    password: string;
    token: string;
    activated: boolean;

    role: UserRole;

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
            },

            role: {
                type: Number,
                required: true
            }
        });
    }
}

export const User = mongoose.model<IUserModel>('User', new UserSchema());
