import * as mongoose from 'mongoose';

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

            episodes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Episode'
            }]
        });
    }
}
export const Season = mongoose.model<ISeasonModel>('Season', new SeasonSchema());