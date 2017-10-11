import { Document } from 'mongoose';
import { IEpisode } from 'interfaces/episode.interface';

export interface ISeason {
    remoteId: number;
    name: string;
    number: number;
    image: string;

    premiere: Date;
    end: Date;

    folder: string;

    episodes: IEpisode[];
}

export interface ISeasonModel extends ISeason, Document { }