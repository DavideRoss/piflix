import * as mongoose from 'mongoose';

import { IEpisode, IEpisodeModel } from 'interfaces/episode.interface';
import { ISeason } from 'interfaces/season.interface';
import { IShow } from 'interfaces/show.interface';

export class EpisodeSchema extends mongoose.Schema implements IEpisode {
    remoteId: number;
    name: string;
    number: number;
    date: Date;
    runTime: number;
    summary: string;
    image: string;

    file: string;
    alias: string;

    show: IShow;
    season: ISeason;

    constructor() {
        super({
            alias: String,
            date: Date,
            file: String,
            image: String,
            name: String,
            number: Number,
            remoteId: Number,
            runTime: Number,

            season: {
                ref: 'Season',
                type: mongoose.Schema.Types.ObjectId
            },

            show: {
                ref: 'Show',
                type: mongoose.Schema.Types.ObjectId
            },

            summary: String
        });
    }
}

// tslint:disable-next-line:variable-name
export const Episode = mongoose.model<IEpisodeModel>('Episode', new EpisodeSchema());
