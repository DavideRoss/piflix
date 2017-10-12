import * as mongoose from 'mongoose';

import { IShow } from 'interfaces/show.interface';
import { ISeason, ISeasonModel } from 'interfaces/season.interface';
import { IEpisode } from 'interfaces/episode.interface';

export class SeasonSchema extends mongoose.Schema implements ISeason {
    remoteId: number;
    name: string;
    number: number;
    image: string;

    premiere: Date;
    end: Date;

    folder: string;

    show: IShow;
    episodes: IEpisode[];

    constructor() {
        super({
            remoteId: Number,
            name: String,
            number: Number,
            image: String,

            premiere: Date,
            end: Date,

            folder: String,

            show: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Show'
            },

            episodes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Episode'
            }]
        });
    }
}
export const Season = mongoose.model<ISeasonModel>('Season', new SeasonSchema());