import { hashPassword } from 'utils/crypt';
import * as mongodb from 'mongodb';

import { TokenLevel } from 'models/token.model';

let ObjectId = mongodb.ObjectID;

let expireDate = new Date();
expireDate.setTime(expireDate.getTime() + 1000000000);

let testData: any = {};

testData.User = {
    u1: {
        _id: new ObjectId,
        activated: false,
        mail: '1@crispybacontest.it',
        password: hashPassword('1')
    },

    u2: {
        _id: new ObjectId,
        activated: true,
        mail: '2@crispybacontest.it',
        password: hashPassword('2')
    }
};

testData.Token = {
    t1n: {
        _id: new ObjectId(),
        value: '1n',
        expireAt: expireDate,
        level: TokenLevel.authenticate
    }
};

export = testData;
