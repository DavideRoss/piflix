import { injectable } from 'inversify';

import * as mongoose from 'mongoose';
import * as fixtures from 'pow-mongoose-fixtures';

import { Configuration } from 'core/config';
import { Logger } from 'core/log';

import { User } from 'models/user.model';
import { Token } from 'models/token.model';
import { Show } from 'models/show.model';
import { Season } from 'models/season.model';
import { Episode } from 'models/episode.model';

@injectable()
export class Db {
    connection: mongoose.Connection;

    constructor(
        private _config: Configuration,
        private _log: Logger,
    ) { }

    public setup(): Promise<any> {
        let password = this._config.mongo.password ? `:${this._config.mongo.password}` : '';
        let auth = (this._config.mongo.user || password) ? this._config.mongo.user + password + '@' : '';
        let uri = `mongodb://${auth}${this._config.mongo.host}/${this._config.mongo.database}`;

        // Prevent mongoose Promise deprecation message
        (<any>mongoose).Promise = global.Promise;

        return new Promise((resolve, reject) => {
            if (mongoose.connection.readyState) {
                this._log.info(`Connected to MongoDB database "${this._config.mongo.database}"`);
                this.connection = mongoose.connection;
                resolve();
            } else {
                mongoose.connect(uri, {
                    useMongoClient: true
                }, err => {
                    if (err) {
                        return reject(err);
                    }

                    this._log.info(`Connected to MongoDB database "${this._config.mongo.database}"`);
                    this.connection = mongoose.connection;
                    resolve();
                });
            }
        });
    }

    async clearDb(): Promise<void> {
        await Promise.all([
            User.remove({}),
            Token.remove({}),
            Show.remove({}),
            Season.remove({}),
            Episode.remove({})
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