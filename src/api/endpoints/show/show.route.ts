import { injectable } from 'inversify';
import { Router } from 'express';

import { Policy, Roles } from 'core/policy';

import { ShowController } from 'api/endpoints/show/show.controller';
import { ShowValidator } from 'api/endpoints/show/show.validator';

@injectable()
export class ShowRoute {
    constructor(
        private _policy: Policy,
        private _showController: ShowController,
        private _showValidator: ShowValidator
    ) { }

    setupRoutes(router: Router) {
        // TODO: add API docs
        router.get('/show/search',
            this._policy.is(Roles.administrator),
            this._showValidator.seachRemote,
            this._showController.searchRemote
        );

        router.post('/show/import/:id',
            this._policy.is(Roles.administrator),
            this._showValidator.importFromRemote,
            this._showController.importFromRemote.bind(this._showController)
        );

        router.get('/show/:id/detect-folder',
            this._policy.is(Roles.administrator),
            this._showValidator.detectFolder,
            this._showController.detectFolder.bind(this._showController)
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
    }
}