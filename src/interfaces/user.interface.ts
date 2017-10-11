import { Document } from 'mongoose';

export interface IUser {
    mail: string;
    password: string;
    token: string;
    activated: boolean;
}

export interface IUserModel extends IUser, Document { }