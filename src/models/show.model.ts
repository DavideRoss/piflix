import * as mongoose from 'mongoose';

import { IShow, IShowModel } from 'interfaces/show.interface';
import { ISeason } from 'interfaces/season.interface';
import { IEpisode } from 'interfaces/episode.interface';

export class ShowSchema extends mongoose.Schema implements IShow {
    remoteId: number;
    name: string;
    image: string;
    officialSite: string;

    folder: string;
    alias: string;

    seasons: ISeason[];
    episodes: IEpisode[];

    constructor() {
        super({
            remoteId: Number,
            name: String,
            image: String,
            officialSite: String,

            folder: String,
            alias: String,

            seasons: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Season'
            }],

            episodes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Episode'
            }]
        });
    }
}

export const Show = mongoose.model<IShowModel>('Show', new ShowSchema());
