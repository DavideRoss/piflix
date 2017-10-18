import * as mongoose from 'mongoose';

import { IEpisode } from 'interfaces/episode.interface';
import { ISeason } from 'interfaces/season.interface';
import { IShow, IShowModel } from 'interfaces/show.interface';

export class ShowSchema extends mongoose.Schema implements IShow {
    remoteId: number;
    name: string;
    image: string;
    officialSite: string;
    premiere: Date;

    folder: string;
    alias: string;

    seasons: ISeason[];
    episodes: IEpisode[];

    constructor() {
        super({
            alias: String,

            episodes: [{
                ref: 'Episode',
                type: mongoose.Schema.Types.ObjectId
            }],

            folder: String,
            image: String,
            name: String,
            officialSite: String,
            premiere: Date,
            remoteId: Number,

            seasons: [{
                ref: 'Season',
                type: mongoose.Schema.Types.ObjectId
            }]
        });
    }
}

// tslint:disable-next-line:variable-name
export const Show = mongoose.model<IShowModel>('Show', new ShowSchema());
