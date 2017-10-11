import { Request } from 'express';
import { IUserModel } from 'interfaces/user.interface';

export interface RequestSessionHandler extends Request {
    user?: IUserModel;
}
