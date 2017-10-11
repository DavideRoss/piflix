import * as mongoose from 'mongoose';

import { IShow, IShowModel } from 'interfaces/show.interface';
import { ISeason } from 'interfaces/season.interface';

export class ShowSchema extends mongoose.Schema implements IShow {
    remoteId: number;
    name: string;
    image: string;
    officialSite: string;

    folder: string;

    seasons: ISeason[];

    constructor() {
        super({
            remoteId: Number,
            name: String,
            image: String,
            officialSite: String,

            folder: String,

            seasons: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Season'
            }]
        });
    }
}

export const Show = mongoose.model<IShowModel>('Show', new ShowSchema());
