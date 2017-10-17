import { injectable } from 'inversify';

import * as request from 'request-promise-native';
import * as _ from 'lodash';
import * as sim from 'string-similarity';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as moment from 'moment';
import * as striptags from 'striptags';
import * as junk from 'junk';

import { Configuration } from 'core/config';
import { Db } from 'core/db';
import { ImageProvider } from 'core/image';
import { ApiError, ErrorCode } from 'core/error-codes';

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
        let obj = await request.get(this._config.external.api + '/singlesearch/shows?q=' + encodeURIComponent(req.query.q));
        res.send(this._apiShowFactory.parse(obj));
    }

    async importFromRemote(req: RequestSessionHandler, res) {
        let objStr = await request.get(this._config.external.api + '/shows/' + req.params.id + '?embed[]=episodes&embed[]=seasons');
        let obj = JSON.parse(objStr);

        let newShow = new Show({
            remoteId: obj.id,
            name: obj.name,
            officialSite: obj.officialSite,
            alias: _.kebabCase(obj.name),
            premiere: moment(obj.premiered, 'YYYY-MM-DD').toDate(),
            seasons: [],
            episodes: []
        });

        newShow.image = await this._imageProvider.download(obj.image.original, newShow.alias);

        let seasons = _.groupBy(obj._embedded.episodes, 'season');

         await Promise.all(Object.keys(seasons).map(async k => {
            let seasonObj = obj._embedded.seasons.find(e => e.number = k);
            let newSeason = new Season({
                remoteId: seasonObj.id,
                name: seasonObj.name,
                number: seasonObj.number,
                premiere: moment(seasonObj.premiereDate, 'YYYY-MM-DD').toDate(),
                end: moment(seasonObj.endDate, 'YYYY-MM-DD').toDate(),
                episodes: [],
                alias: _.kebabCase('Season ' + seasonObj.number),

                show: newShow._id
            });

            newSeason.image = await this._imageProvider.download(
                seasonObj.image.original,
                path.join(newShow.alias, newSeason.alias)
            );

            let list = seasons[k];

            await Promise.all(list.map(async (e: any) => {
                let newEpisode = new Episode({
                    remoteId: e.id,
                    name: e.name,
                    number: e.number,
                    date: moment(e.airstamp),
                    runTime: e.runtime,
                    summary: striptags(e.summary),
                    alias: _.kebabCase(e.name),

                    show: newShow._id,
                    season: newSeason._id
                });

                newEpisode.image = await this._imageProvider.download(
                    e.image.original,
                    path.join(newShow.alias, newSeason.alias, newEpisode.alias)
                );

                newSeason.episodes.push(newEpisode._id);
                newShow.episodes.push(newEpisode._id);

                await newEpisode.save();
            }));

            newShow.seasons.push(newSeason._id);

            await newSeason.save();
        }));

        await newShow.save();

        res.send({
            created: newShow._id
        });
    }

    async detectShow(req, res) {
        let show = await Show.findById(new mongoose.Types.ObjectId(req.params.id));

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        let dirs = (await fs.readdir(this._config.files.base)).filter(junk.not);
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

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        show.seasons.forEach(season => {
            let seasonRegex = new RegExp(`s(eason)? ?0?${season.number}`, 'i');

            let found = dirs.find(e => seasonRegex.test(e));
            dirs.splice(dirs.indexOf(found), 1);

            out.push({
                id: (season as ISeasonModel)._id.toString(),
                number: season.number,
                folder: found
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

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        if (!season) {
            throw new ApiError(ErrorCode.missing_season);
        }

        let files = await fs.readdir(this._config.files.base + '/' + show.folder + '/' + req.body.folder);
        let out = [];

        season.episodes.forEach(episode => {
            let epRegex = new RegExp(`(s|e)?0?${season.number}(x|e)0?${episode.number}`, 'i');

            let found = files.find(e => epRegex.test(e));
            files.splice(files.indexOf(found), 1);

            out.push({
                id: (episode as IEpisodeModel)._id.toString(),
                number: episode.number,
                file: found
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

        if (!season) {
            throw new ApiError(ErrorCode.missing_season);
        }

        req.body.matches.forEach(async match => {
            let ep = season.episodes.find(e => (e as IEpisodeModel)._id.toString() === match.episode) as IEpisodeModel;

            if (!ep) {
                throw new ApiError(ErrorCode.missing_episode);
            }

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

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        let out = [];
        let templatePath = req.body.template.split(path.sep);

        if (templatePath.length !== 3) {
            throw new ApiError(ErrorCode.wrong_path_template);
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
    private parseTemplate(template: string, show: IShow, season?: ISeason, episode?: IEpisode): string {
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