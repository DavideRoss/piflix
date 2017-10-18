import { injectable } from 'inversify';

import * as junk from 'junk';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as request from 'request-promise-native';
import * as sim from 'string-similarity';
import * as striptags from 'striptags';

import { Configuration } from 'core/config';
import { ApiError, ErrorCode } from 'core/error-codes';
import { ImageProvider } from 'core/image';

import * as fs from 'utils/promise-fs';

import { IRequestSessionHandler } from 'api/request-session-handler';

import { ApiShowFactory } from 'models/external/show.model';

import { IEpisode, IEpisodeModel } from 'interfaces/episode.interface';
import { ISeason, ISeasonModel } from 'interfaces/season.interface';
import { IShow } from 'interfaces/show.interface';

import { Episode } from 'models/episode.model';
import { Season } from 'models/season.model';
import { Show } from 'models/show.model';

@injectable()
export class ShowController {
    constructor(
        private _config: Configuration,
        private _apiShowFactory: ApiShowFactory,
        private _imageProvider: ImageProvider
    ) {
        this.searchRemote = this.searchRemote.bind(this);
    }

    async searchRemote(req: IRequestSessionHandler, res) {
        const obj = await request.get(this._config.external.api + '/singlesearch/shows?q=' + encodeURIComponent(req.query.q));
        res.send(this._apiShowFactory.parse(obj));
    }

    async importFromRemote(req: IRequestSessionHandler, res) {
        const objStr = await request.get(this._config.external.api + '/shows/' + req.params.id + '?embed[]=episodes&embed[]=seasons');
        const obj = JSON.parse(objStr);

        const newShow = new Show({
            alias: _.kebabCase(obj.name),
            episodes: [],
            name: obj.name,
            officialSite: obj.officialSite,
            premiere: moment(obj.premiered, 'YYYY-MM-DD').toDate(),
            remoteId: obj.id,
            seasons: [],
        });

        newShow.image = await this._imageProvider.download(obj.image.original, newShow.alias);

        const seasons = _.groupBy(obj._embedded.episodes, 'season');

        await Promise.all(Object.keys(seasons).map(async k => {
            const seasonObj = obj._embedded.seasons.find(e => e.number = k);
            const newSeason = new Season({
                alias: _.kebabCase('Season ' + seasonObj.number),
                end: moment(seasonObj.endDate, 'YYYY-MM-DD').toDate(),
                episodes: [],
                name: seasonObj.name,
                number: seasonObj.number,
                premiere: moment(seasonObj.premiereDate, 'YYYY-MM-DD').toDate(),
                remoteId: seasonObj.id,

                show: newShow._id
            });

            newSeason.image = await this._imageProvider.download(
                seasonObj.image.original,
                path.join(newShow.alias, newSeason.alias)
            );

            const list = seasons[k];

            await Promise.all(list.map(async (e: any) => {
                const newEpisode = new Episode({
                    alias: _.kebabCase(e.name),
                    date: moment(e.airstamp),
                    name: e.name,
                    number: e.number,
                    remoteId: e.id,
                    runTime: e.runtime,
                    season: newSeason._id,
                    show: newShow._id,
                    summary: (striptags as any)(e.summary)
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
        const show = await Show.findById(new mongoose.Types.ObjectId(req.params.id));

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        const dirs = (await fs.readdir(this._config.files.base)).filter(junk.not);
        const match = sim.findBestMatch(show.name, dirs);

        res.send({
            folders: dirs,
            suggested: match.bestMatch.target
        });
    }

    async detectSeasons(req, res) {
        const show = await Show.findById(new mongoose.Types.ObjectId(req.params.show)).populate('seasons');
        const dirs = await fs.readdir(this._config.files.base + '/' + req.body.folder);

        const out = [];

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        show.seasons.forEach(season => {
            const seasonRegex = new RegExp(`s(eason)? ?0?${season.number}`, 'i');

            const found = dirs.find(e => seasonRegex.test(e));
            dirs.splice(dirs.indexOf(found), 1);

            out.push({
                folder: found,
                id: (season as ISeasonModel)._id.toString(),
                number: season.number
            });
        });

        res.send({
            folders: dirs,
            matches: out
        });

        // Save show folder on database
        show.folder = req.body.folder;
        show.save();
    }

    async detectFiles(req, res) {
        const show = await Show.findById(new mongoose.Types.ObjectId(req.params.show));
        const season = await Season.findById(new mongoose.Types.ObjectId(req.params.season)).populate('episodes');

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        if (!season) {
            throw new ApiError(ErrorCode.missing_season);
        }

        const files = await fs.readdir(this._config.files.base + '/' + show.folder + '/' + req.body.folder);
        const out = [];

        season.episodes.forEach(episode => {
            const epRegex = new RegExp(`(s|e)?0?${season.number}(x|e)0?${episode.number}`, 'i');

            const found = files.find(e => epRegex.test(e));
            files.splice(files.indexOf(found), 1);

            out.push({
                file: found,
                id: (episode as IEpisodeModel)._id.toString(),
                number: episode.number
            });
        });

        res.send({
            files,
            matches: out
        });

        // Save season folder on database
        season.folder = req.body.folder;
        season.save();
    }

    async matchEpisodes(req, res) {
        const season = await Season.findById(new mongoose.Types.ObjectId(req.params.season)).populate('episodes');

        if (!season) {
            throw new ApiError(ErrorCode.missing_season);
        }

        req.body.matches.forEach(async match => {
            const ep = season.episodes.find(e => (e as IEpisodeModel)._id.toString() === match.episode) as IEpisodeModel;

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
        const show = await Show.findById(new mongoose.Types.ObjectId(req.params.show)).populate({
            path: 'seasons',
            populate: {
                model: 'Episode',
                path: 'episodes'
            }
        });

        if (!show) {
            throw new ApiError(ErrorCode.missing_show);
        }

        const out = [];
        const templatePath = req.body.template.split(path.sep);

        if (templatePath.length !== 3) {
            throw new ApiError(ErrorCode.wrong_path_template);
        }

        await Promise.all(show.seasons.map(async season => {
            if (!season.folder) return;

            await Promise.all(season.episodes.map(async episode => {
                if (!episode.file) return;

                const oldPath = path.join(
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

                const dirs = newPath.split(path.sep).slice(-3, -1);
                await fs.mkdirp(path.join.apply(null, [this._config.files.base, ...dirs]));
                await fs.rename(oldPath, newPath);

                out.push({
                    new: newPath.split(path.sep).slice(-templatePath.length),
                    old: oldPath
                });
            }));
        }));

        const newShowFolder = this.parseTemplate(templatePath[0], show);

        if (newShowFolder !== show.folder) {
            await fs.rimraf(path.join(this._config.files.base, show.folder));
            show.folder = newShowFolder;
            await show.save();
        } else {
            await Promise.all(show.seasons.map(async (season) => {
                if (!season.folder) return;
                const newSeasonFolder = this.parseTemplate(templatePath[1], show, season);

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
