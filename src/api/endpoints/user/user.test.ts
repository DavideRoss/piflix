require('app-module-path').addPath(__dirname + '/../../../');
import 'reflect-metadata';

import 'mocha';
import * as Request from 'supertest';
import * as utilTest from 'utils/test';

import expect = require('expect.js');

let glob: utilTest.TestGlobals;

describe('User', () => {
    before(async () => {
        let t = await utilTest.init_e2e();
        glob = t;
    });

    after(async () => {
        await glob.api.close();
    });

    beforeEach(async () => {
        await glob.db.clearDb();
        await glob.db.loadDataFromFile(require('./user.test.data.js'));
    });

    describe('login', () => {
        it('should not login as a not activated user', async () => {
            await Request(glob.url)
                .post('user/login')
                .send({
                    mail: '1@crispybacon.it',
                    password: '1'
                })
                .expect(401);
        });

        it('should not login with a wrong e-mail', async () => {
            await Request(glob.url)
                .post('user/login')
                .send({
                    mail: '222@crispybacontest.it',
                    password: '1'
                })
                .expect(401);
        });

        it('should not login with a wrong password', async () => {
            await Request(glob.url)
                .post('user/login')
                .send({
                    mail: '1@crispybacontest.it',
                    password: '2'
                })
                .expect(401);
        });

        it('should login as an activated user', async () => {
            let res = await Request(glob.url)
                .post('user/login')
                .send({
                    mail: '2@crispybacontest.it',
                    password: '2'
                })
                .expect(200);
            expect(res.body.mail).to.be('2@crispybacontest.it');
        });
    });
});