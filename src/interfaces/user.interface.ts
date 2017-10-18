import { Document } from 'mongoose';

import { UserRole } from 'models/user.model';

export interface IUser {
    mail: string;
    password: string;
    token: string;
    activated: boolean;
    role: UserRole;
}

export interface IUserModel extends IUser, Document { }
