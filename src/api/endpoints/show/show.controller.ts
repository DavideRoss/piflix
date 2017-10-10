import { injectable } from 'inversify';

import * as request from 'request-promise-native';
import * as _ from 'lodash';
import * as sim from 'string-similarity';
import * as mongoose from 'mongoose';

import { Db } from 'core/db';
import { Configuration } from 'core/config';

import * as fs from 'utils/promise-fs';

import { RequestSessionHandler } from 'api/request-session-handler';

import { ApiShowInstance, ApiShowFactory } from 'models/external/show.model';
import { ShowInstance } from 'models/show.model';

@injectable()
export class ShowController {
    constructor(
        private _db: Db,
        private _config: Configuration,
        private _apiShowFactory: ApiShowFactory
    ) {
        this.searchRemote = this.searchRemote.bind(this);
    }

    async searchRemote(req: RequestSessionHandler, res) {
        let obj = await request.get('http://api.tvmaze.com/singlesearch/shows?q=' + encodeURIComponent(req.query.q));
        res.send(this._apiShowFactory.parse(obj));
    }

    async importFromRemote(req: RequestSessionHandler, res) {
        let objStr = await request.get('http://api.tvmaze.com/shows/' + req.params.id + '?embed[]=episodes&embed[]=seasons');
        let obj = JSON.parse(objStr);

        let seasons = _.groupBy(obj._embedded.episodes, 'season');

        let seasonIds = await Promise.all(Object.keys(seasons).map(async k => {
            let list = seasons[k];

            let episodes = await Promise.all(list.map(async e => {
                let newEpisode = new this._db.models.Episode({
                    remoteId: e.id,
                    name: e.name,
                    number: e.number,
                    date: new Date(), // TODO: parse date
                    runTime: 0, // TODO: parse number
                    summary: e.summary, // TODO: clean HTML tags
                    image: e.image.original // TODO: download image
                });

                await newEpisode.save();
                return newEpisode._id;
            }));

            let seasonObj = obj._embedded.seasons.find(e => e.number = k);
            let newSeason = new this._db.models.Season({
                remoteId: seasonObj.id,
                name: seasonObj.name,
                number: seasonObj.number,
                image: seasonObj.image.original, // TODO: download image
                premiere: new Date(), // TODO: parse date
                end: new Date(), // TODO: parse date
                episodes
            });

            await newSeason.save();
            return newSeason._id;
        }));

        let newShow = new this._db.models.Show({
            remoteId: obj.id,
            name: obj.name,
            image: obj.image.original, // TODO: download.image
            officialSite: obj.officialSite,
            seasons: seasonIds
        });

        await newShow.save();

        res.send({
            created: newShow._id
        });
    }

    async detectFolder(req, res) {
        // TODO: verify base directory existence before run this method (on init?)
        // TODO: handle missing show (404)
        // TODO: refactor folder => show
        // TODO: exclude system folders (multiplatform)

        let show = await this._db.models.Show.findById(new mongoose.Types.ObjectId(req.params.id));

        let dirs = await fs.readdir(this._config.files.base);
        let match = sim.findBestMatch(show.name, dirs);

        res.send({
            suggested: match.bestMatch.target,
            folders: dirs
        });
    }

    async detectSeasons(req, res) {
        let show = await this._db.models.Show.findById(new mongoose.Types.ObjectId(req.params.show)).populate('seasons');
        let dirs = await fs.readdir(this._config.files.base + '/' + req.body.folder);

        let out = [];

        // TODO: handle missing show (404)

        show.seasons.forEach(season => {
            let seasonRegex = new RegExp(`s(eason)? ?0?${season.number}`, 'i');

            // TODO: remove duplicate folders

            out.push({
                id: season._id.toString(),
                number: season.number,
                folder: dirs.find(e => seasonRegex.test(e))
            });
        });

        res.send({
            matches: out,
            folders: dirs
        });

        // Save show folder on database
        show.folder = req.body.folder;
        show.save();
    }

    async detectFiles(req, res) {
        let show = await this._db.models.Show.findById(new mongoose.Types.ObjectId(req.params.show));
        let season = await this._db.models.Season.findById(new mongoose.Types.ObjectId(req.params.season)).populate('episodes');

        // TODO: handle missing show
        // TODO: handle missing season

        let files = await fs.readdir(this._config.files.base + '/' + show.folder + '/' + req.body.folder);
        let out = [];

        season.episodes.forEach(episode => {
            let epRegex = new RegExp(`(s|e)?0?${season.number}(x|e)0?${episode.number}`, 'i');

            // TODO: remove duplicate files

            out.push({
                id: episode._id.toString(),
                number: episode.number,
                folder: files.find(e => epRegex.test(e))
            });
        });

        res.send({
            matches: out,
            files: files
        });

        // Save season folder on database
        season.folder = req.body.folder;
        season.save();
    }

    async matchEpisodes(req, res) {
        
    }
}