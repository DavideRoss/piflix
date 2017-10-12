import * as mongoose from 'mongoose';

import { IShow } from 'interfaces/show.interface';
import { ISeason } from 'interfaces/season.interface';
import { IEpisode, IEpisodeModel } from 'interfaces/episode.interface';

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
            remoteId: Number,
            name: String,
            number: Number,
            date: Date,
            runTime: Number,
            summary: String,
            image: String,

            file: String,
            alias: String,

            show: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Show'
            },

            season: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Season'
            }
        });
    }
}

export const Episode = mongoose.model<IEpisodeModel>('Episode', new EpisodeSchema());