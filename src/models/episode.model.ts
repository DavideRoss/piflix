import * as mongoose from 'mongoose';

import { injectable } from 'inversify';

export interface EpisodeInstance extends mongoose.Document {
    remoteId: number;
    name: string;
    number: number;
    date: Date;
    runTime: number;
    summary: string;
    image: string;
}

export type EpisodeModel = mongoose.Model<EpisodeInstance>;

let EpisodeSchema = {
    remoteId: Number,
    name: String,
    number: Number,
    date: Date,
    runTime: Number,
    summary: String,
    image: String
};

@injectable()
export class EpisodeFactory {
    attribute: EpisodeFactory;
    model: EpisodeModel;

    constructor() {
        if (mongoose.modelNames().indexOf('Episode') !== -1) {
            this.model = mongoose.model<EpisodeInstance>('Episode');
        } else {
            let schema = new mongoose.Schema(EpisodeSchema);
            this.model = mongoose.model<EpisodeInstance>('Episode', schema);
        }
    }
}
