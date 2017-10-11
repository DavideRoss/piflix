import { Document } from 'mongoose';

export interface IEpisode {
    remoteId: number;
    name: string;
    number: number;
    date: Date;
    runTime: number;
    summary: string;
    image: string;

    file: string;
}

export interface IEpisodeModel extends IEpisode, Document { }