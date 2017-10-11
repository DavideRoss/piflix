import * as mongoose from 'mongoose';

import { IEpisode, IEpisodeModel } from 'interfaces/episode.interface';

export class EpisodeSchema extends mongoose.Schema implements IEpisode {
    public remoteId: number;
    public name: string;
    public number: number;
    public date: Date;
    public runTime: number;
    public summary: string;
    public image: string;
    public file: string;

    constructor() {
        super({
            remoteId: Number,
            name: String,
            number: Number,
            date: Date,
            runTime: Number,
            summary: String,
            image: String,

            file: String
        });
    }
}

export const Episode = mongoose.model<IEpisodeModel>('Episode', new EpisodeSchema());