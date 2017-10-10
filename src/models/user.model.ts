import * as mongoose from 'mongoose';

import { injectable } from 'inversify';

export interface UserInstance extends mongoose.Document {
    mail: string;
    password: string;
    token: string;
    activated: boolean;
}

export type UserModel = mongoose.Model<UserInstance>;

let UserSchema = {
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
};

@injectable()
export class UserFactory {
    attribute: UserFactory;
    model: UserModel;

    constructor() {
        if (mongoose.modelNames().indexOf('User') !== -1) {
            this.model = mongoose.model<UserInstance>('User');
        } else {
            let schema = new mongoose.Schema(UserSchema);
            this.model = mongoose.model<UserInstance>('User', schema);
        }
    }
}