import { Request } from 'express';
import { UserInstance } from 'models/user.model';

export interface RequestSessionHandler extends Request {
    user?: UserInstance;
}
