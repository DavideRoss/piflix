import { injectable } from 'inversify';

import * as request from 'request-promise-native';
import * as _ from 'lodash';
import * as sim from 'string-similarity';
import * as mongoose from 'mongoose';
import * as path from 'path';

import { Configuration } from 'core/config';
import { Db } from 'core/db';
import { ImageProvider } from 'core/image';

import * as fs from 'utils/promise-fs';

import { RequestSessionHandler } from 'api/request-session-handler';

import { ApiShowInstance, ApiShowFactory } from 'models/external/show.model';

import { IShow, IShowModel } from 'interfaces/show.interface';
import { ISeason, ISeasonModel } from 'interfaces/season.interface';
import { IEpisode, IEpisodeModel } from 'interfaces/episode.interface';

import { Show } from 'models/show.model';
import { Season } from 'models/season.model';
import { Episode } from 'models/episode.model';

@injectable()
export class ShowController {
    constructor(
        private _db: Db,
        private _config: Configuration,
        private _apiShowFactory: ApiShowFactory,
        private _imageProvider: ImageProvider
    ) {
        this.searchRemote = this.searchRemote.bind(this);
    }

    async searchRemote(req: RequestSessionHandler, res) {
        // TODO: move base API path to config file
        let obj = await request.get('http://api.tvmaze.com/singlesearch/shows?q=' + encodeURIComponent(req.query.q));
        res.send(this._apiShowFactory.parse(obj));
    }

    async importFromRemote(req: RequestSessionHandler, res) {
        let objStr = await request.get('http://api.tvmaze.com/shows/' + req.params.id + '?embed[]=episodes&embed[]=seasons');
        let obj = JSON.parse(objStr);

        let seasons = _.groupBy(obj._embedded.episodes, 'season');

        let seasonIds = await Promise.all(Object.keys(seasons).map(async k => {
            let list = seasons[k];

            let episodes = await Promise.all(list.map(async (e: any) => {
                let newEpisode = new Episode({
                    remoteId: e.id,
                    name: e.name,
                    number: e.number,
                    date: new Date(), // TODO: parse date
                    runTime: 0, // TODO: parse number
                    summary: e.summary, // TODO: clean HTML tags
                    image: await this._imageProvider.download(e.image.original)
                });

                await newEpisode.save();
                return newEpisode._id;
            }));

            let seasonObj = obj._embedded.seasons.find(e => e.number = k);
            let newSeason = new Season({
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

        let newShow = new Show({
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

        let show = await Show.findById(new mongoose.Types.ObjectId(req.params.id));

        let dirs = await fs.readdir(this._config.files.base);
        let match = sim.findBestMatch(show.name, dirs);

        res.send({
            suggested: match.bestMatch.target,
            folders: dirs
        });
    }

    async detectSeasons(req, res) {
        let show = await Show.findById(new mongoose.Types.ObjectId(req.params.show)).populate('seasons');
        let dirs = await fs.readdir(this._config.files.base + '/' + req.body.folder);

        let out = [];

        // TODO: handle missing show (404)

        show.seasons.forEach(season => {
            let seasonRegex = new RegExp(`s(eason)? ?0?${season.number}`, 'i');

            // TODO: remove duplicate folders

            out.push({
                id: (season as ISeasonModel)._id.toString(),
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
        let show = await Show.findById(new mongoose.Types.ObjectId(req.params.show));
        let season = await Season.findById(new mongoose.Types.ObjectId(req.params.season)).populate('episodes');

        // TODO: handle missing show
        // TODO: handle missing season

        let files = await fs.readdir(this._config.files.base + '/' + show.folder + '/' + req.body.folder);
        let out = [];

        season.episodes.forEach(episode => {
            let epRegex = new RegExp(`(s|e)?0?${season.number}(x|e)0?${episode.number}`, 'i');

            // TODO: remove duplicate files

            out.push({
                id: (episode as IEpisodeModel)._id.toString(),
                number: episode.number,
                file: files.find(e => epRegex.test(e))
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
        let season = await Season.findById(new mongoose.Types.ObjectId(req.params.season)).populate('episodes');

        // TODO: handle missing season

        req.body.matches.forEach(async match => {
            let ep = season.episodes.find(e => (e as IEpisodeModel)._id.toString() === match.episode) as IEpisodeModel;

            // TODO: handle missing episode

            ep.file = match.file;
            await ep.save();
        });

        res.send({
            status: 'ok'
        });
    }

    async rebuildPaths(req, res) {
        let show = await Show.findById(new mongoose.Types.ObjectId(req.params.show)).populate({
            path: 'seasons',
            populate: {
                path: 'episodes',
                model: 'Episode'
            }
        });

        // TODO: handle missing show

        let out = [];
        let templatePath = req.body.template.split(path.sep);

        if (templatePath.length !== 3) {
            // TODO: handle missing folder error, format has to be show/season/episode
            return res.status(400).send({
                path: templatePath
            });
        }

        await Promise.all(show.seasons.map(async season => {
            if (!season.folder) return;

            await Promise.all(season.episodes.map(async episode => {
                if (!episode.file) return;

                let oldPath = path.join(
                    this._config.files.base,
                    show.folder,
                    season.folder,
                    episode.file
                );

                let newPath = this.parseTemplate(req.body.template, show, season, episode);

                newPath = path.join(
                    this._config.files.base,
                    newPath + path.extname(oldPath)
                );

                let dirs = newPath.split(path.sep).slice(-3, -1);
                await fs.mkdirp(path.join.apply(null, [this._config.files.base, ...dirs]));
                await fs.rename(oldPath, newPath);

                out.push({
                    old: oldPath,
                    new: newPath.split(path.sep).slice(-templatePath.length)
                });
            }));
        }));

        let newShowFolder = this.parseTemplate(templatePath[0], show);

        if (newShowFolder !== show.folder) {
            await fs.rimraf(path.join(this._config.files.base, show.folder));
            show.folder = newShowFolder;
            await show.save();
        } else {
            await Promise.all(show.seasons.map(async (season) => {
                if (!season.folder) return;
                let newSeasonFolder = this.parseTemplate(templatePath[1], show, season);

                if (newSeasonFolder !== season.folder) {
                    await fs.rimraf(path.join(this._config.files.base, show.folder, season.folder));
                    season.folder = newSeasonFolder;
                    await (season as ISeasonModel).save();
                }
            }));
        }

        res.send(out);
    }

    /*

        PATH MODEL DOCS:
                                                DONE
        {H} show name                            OK
        {s} season number                        OK
        {S} season number, zero-padded           OK
        {e} episode number                       OK
        {E} episode number, zero-padded          OK
        {n} episode name                         OK

        Characters to be escaped: / \ .

    */
    // TODO: move to external file
    parseTemplate(template: string, show: IShow, season?: ISeason, episode?: IEpisode): string {
        let tmp = template.replace(/\{H\}/gm, show.name);

        if (season) {
            tmp = tmp
                .replace(/\{s\}/gm, season.number.toString())
                .replace(/\{S\}/gm, _.padStart(season.number.toString(), 2, '0'));
        }

        if (episode) {
            tmp = tmp
                .replace(/\{e\}/gm, episode.number.toString())
                .replace(/\{E\}/gm, _.padStart(episode.number.toString(), 2, '0'))
                .replace(/\{n\}/gm, episode.name);
        }

        return tmp;
    }
}