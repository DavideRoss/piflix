import { Router } from 'express';
import { injectable } from 'inversify';

import { Policy, Roles } from 'core/policy';

import { ShowController } from 'api/endpoints/show/show.controller';
import { ShowValidator } from 'api/endpoints/show/show.validator';

import { ExternalService } from 'services/external.service';

@injectable()
export class ShowRoute {
    constructor(
        private _policy: Policy,
        private _showController: ShowController,
        private _showValidator: ShowValidator,
        private _externalService: ExternalService
    ) { }

    setupRoutes(router: Router) {
        // TODO: add API docs
        router.get('/show/search',
            this._policy.is(Roles.administrator),
            this._showValidator.seachRemote,
            this._externalService.checkStatus.bind(this._externalService),
            this._showController.searchRemote
        );

        router.post('/show/import/:id',
            this._policy.is(Roles.administrator),
            this._showValidator.importFromRemote,
            this._externalService.checkStatus.bind(this._externalService),
            this._showController.importFromRemote.bind(this._showController)
        );

        router.get('/show/:id/detect-show',
            this._policy.is(Roles.administrator),
            this._showValidator.detectShow,
            this._showController.detectShow.bind(this._showController)
        );

        router.post('/show/:show/detect-seasons',
            this._policy.is(Roles.administrator),
            this._showValidator.detectSeasons,
            this._showController.detectSeasons.bind(this._showController)
        );

        router.post('/show/:show/season/:season/detect-files',
            this._policy.is(Roles.administrator),
            this._showValidator.detectFiles,
            this._showController.detectFiles.bind(this._showController)
        );

        router.post('/show/:show/season/:season/match',
            this._policy.is(Roles.administrator),
            this._showValidator.matchEpisodes,
            this._showController.matchEpisodes.bind(this._showController)
        );

        router.post('/show/:show/rebuild',
            this._policy.is(Roles.administrator),
            this._showValidator.rebuildPaths,
            this._showController.rebuildPaths.bind(this._showController)
        );

        router.get('/show',
            this._policy.is(Roles.authenticated),
            this._showController.getShows.bind(this._showController)
        );

        router.get('/show/alias/:alias',
            this._policy.is(Roles.authenticated),
            // TODO: add querystring + params validator
            this._showController.getShowDetails.bind(this._showController)
        );
    }
}
