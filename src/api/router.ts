import { injectable } from 'inversify';

import { ShowRoute } from 'api/endpoints/show/show.route';
import { UserRoute } from 'api/endpoints/user/user.route';

import * as express from 'express';

@injectable()
export class RouterFactory {
    public router: express.Router;

    constructor(
        private _userRoute: UserRoute,
        private _showRoute: ShowRoute
    ) {
        this.router = express.Router();

        this._userRoute.setupRoutes(this.router);
        this._showRoute.setupRoutes(this.router);
    }
}
