import * as mongoose from 'mongoose';

import { EpisodeInstance } from 'models/episode.model';

import { injectable } from 'inversify';

export interface SeasonInstance extends mongoose.Document {
    remoteId: number;
    name: string;
    number: number;
    image: string;

    premiere: Date;
    end: Date;

    folder: string;

    episodes: EpisodeInstance[];
}

export type SeasonModel = mongoose.Model<SeasonInstance>;

let SeasonSchema = {
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
};

@injectable()
export class SeasonFactory {
    attribute: SeasonFactory;
    model: SeasonModel;

    constructor() {
        if (mongoose.modelNames().indexOf('Season') !== -1) {
            this.model = mongoose.model<SeasonInstance>('Season');
        } else {
            let schema = new mongoose.Schema(SeasonSchema);
            this.model = mongoose.model<SeasonInstance>('Season', schema);
        }
    }
}
