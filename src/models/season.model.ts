import * as mongoose from 'mongoose';

import { IEpisode } from 'interfaces/episode.interface';
import { ISeason, ISeasonModel } from 'interfaces/season.interface';
import { IShow } from 'interfaces/show.interface';

export class SeasonSchema extends mongoose.Schema implements ISeason {
    remoteId: number;
    name: string;
    number: number;
    image: string;

    premiere: Date;
    end: Date;

    folder: string;
    alias: string;

    show: IShow;
    episodes: IEpisode[];

    constructor() {
        super({
            alias: String,
            end: Date,

            episodes: [{
                ref: 'Episode',
                type: mongoose.Schema.Types.ObjectId
            }],

            folder: String,
            image: String,
            name: String,
            number: Number,
            premiere: Date,
            remoteId: Number,

            show: {
                ref: 'Show',
                type: mongoose.Schema.Types.ObjectId,
            }
        });
    }
}

// tslint:disable-next-line:variable-name
export const Season = mongoose.model<ISeasonModel>('Season', new SeasonSchema());
