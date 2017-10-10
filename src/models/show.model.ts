import * as mongoose from 'mongoose';

import { SeasonInstance } from 'models/season.model';

import { injectable } from 'inversify';

export interface ShowInstance extends mongoose.Document {
    remoteId: number;
    name: string;
    image: string;
    officialSite: string;

    folder: string;

    seasons: SeasonInstance[];
}

export type ShowModel = mongoose.Model<ShowInstance>;

let ShowSchema = {
    remoteId: Number,
    name: String,
    image: String,
    officialSite: String,

    folder: String,

    seasons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season'
    }]
};

@injectable()
export class ShowFactory {
    attribute: ShowFactory;
    model: ShowModel;

    constructor() {
        if (mongoose.modelNames().indexOf('Show') !== -1) {
            this.model = mongoose.model<ShowInstance>('Show');
        } else {
            let schema = new mongoose.Schema(ShowSchema);
            this.model = mongoose.model<ShowInstance>('Show', schema);
        }
    }
}
