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
            activated: {
                default: false,
                type: Boolean
            },

            mail: {
                required: true,
                type: String
            },

            password: {
                required: true,
                type: String
            },

            role: {
                required: true,
                type: Number
            },

            token: String
        });
    }
}

// tslint:disable-next-line:variable-name
export const User = mongoose.model<IUserModel>('User', new UserSchema());
