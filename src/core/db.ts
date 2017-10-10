import { injectable } from 'inversify';

import * as mongoose from 'mongoose';
import * as fixtures from 'pow-mongoose-fixtures';

import { Configuration } from 'core/config';
import { Logger } from 'core/log';

import { UserInstance, UserModel, UserFactory } from 'models/user.model';
import { TokenInstance, TokenModel, TokenFactory } from 'models/token.model';

import { ShowInstance, ShowModel, ShowFactory } from 'models/show.model';
import { SeasonFactory, SeasonInstance, SeasonModel } from 'models/season.model';
import { EpisodeInstance, EpisodeModel, EpisodeFactory } from 'models/episode.model';

export interface Models {
    User: UserModel;
    Token: TokenModel;
    Show: ShowModel;
    Season: SeasonModel;
    Episode: EpisodeModel;
}

@injectable()
export class Db {
    models: Models;
    connection: mongoose.Connection;

    constructor(
        private _config: Configuration,
        private _log: Logger,

        private _user: UserFactory,
        private _token: TokenFactory,
        private _show: ShowFactory,
        private _season: SeasonFactory,
        private _episode: EpisodeFactory
    ) { }

    public setup(): Promise<any> {
        let password = this._config.mongo.password ? `:${this._config.mongo.password}` : '';
        let auth = (this._config.mongo.user || password) ? this._config.mongo.user + password + '@' : '';
        let uri = `mongodb://${auth}${this._config.mongo.host}/${this._config.mongo.database}`;

        // Prevent mongoose Promise deprecation message
        (<any>mongoose).Promise = global.Promise;

        return new Promise((resolve, reject) => {
            if (mongoose.connection.readyState) {
                this._setupModels();
                resolve();
            } else {
                mongoose.connect(uri, {
                    useMongoClient: true
                }, err => {
                    if (err) {
                        return reject(err);
                    }

                    this._setupModels();
                    resolve();
                });
            }
        });
    }

    private _setupModels() {
        this._log.info(`Connected to MongoDB database "${this._config.mongo.database}"`);
        this.connection = mongoose.connection;

        this.models = {
            User: this._user.model,
            Token: this._token.model,
            Show: this._show.model,
            Season: this._season.model,
            Episode: this._episode.model
        };
    }

    async clearDb(): Promise<void> {
        await Promise.all([
            this.models.User.remove({}),
            this.models.Token.remove({}),
            this.models.Show.remove({}),
            this.models.Season.remove({}),
            this.models.Episode.remove({})
        ]);
    }

    loadDataFromFile(data): Promise<void> {
        return new Promise((resolve, reject) => {
            fixtures.load(data, this.connection, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}