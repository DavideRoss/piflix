import { UserValidator } from './user.validator';
import { injectable } from 'inversify';
import { Router } from 'express';

import { Policy } from 'core/policy';

import { UserController } from 'api/endpoints/user/user.controller';

@injectable()
export class UserRoute {
    constructor(
        private _policy: Policy,
        private _userValidator: UserValidator,
        private _userController: UserController
    ) { }

    setupRoutes(router: Router) {

        // TODO: add errors description

        /**
         *
         * @api {POST} /user/login Login
         * @apiName Login
         * @apiGroup User
         * @apiVersion  1.0.0
         *
         * @apiDescription Perform user login through e-mail and password authentication strategy
         *
         * @apiParam  {String} mail E-mail associated to an account
         * @apiParam  {String} password Plain password
         *
         * @apiSuccess (200) {string} token Access token for HTTP Authentication
         * @apiSuccess (200) {string} id UUID of the logged user
         * @apiSuccess (200) {string} mail E-mail address
         *
         * @apiParamExample  {json} Request-Example:
           {
               "mail": "davide@crispybacon.it",
               "password": "test1234"
           }
         *
         *
         * @apiSuccessExample {json} Success-Response:
           {
               "token": "gPjyD1d9t2Nz1k6m",
               "id": "59ba42d38af57e33455f31c2"
               "mail": "davide@crispybacon.it"
           }
         *
         *
         */
        router.post('/user/login', this._userValidator.login, this._userController.login);

        /**
         *
         * @api {POST} /user/logout Logout
         * @apiName Logout
         * @apiGroup User
         * @apiVersion  1.0.0
         *
         * @apiDescription Perform user logout and invalidate the user token
         *
         * @apiSuccessExample {json} Success-Response:
           HTTP/1.1 200 OK
         *
         *
         */
        router.post('/user/logout', this._userController.logout);
    }
}

