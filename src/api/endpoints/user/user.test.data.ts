import * as mongodb from 'mongodb';
import { hashPassword } from 'utils/crypt';

import { TokenLevel } from 'interfaces/token.interface';

// tslint:disable-next-line:variable-name
const ObjectId = mongodb.ObjectID;

const expireDate = new Date();
expireDate.setTime(expireDate.getTime() + 1000000000);

const testData: any = {};

testData.User = {
    u1: {
        _id: new ObjectId(),
        activated: false,
        mail: '1@crispybacontest.it',
        password: hashPassword('1')
    },

    u2: {
        _id: new ObjectId(),
        activated: true,
        mail: '2@crispybacontest.it',
        password: hashPassword('2')
    }
};

testData.Token = {
    t1n: {
        _id: new ObjectId(),
        expireAt: expireDate,
        level: TokenLevel.authenticate,
        value: '1n',
    }
};

export = testData;
