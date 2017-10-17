import { Document } from 'mongoose';

import { ISeason } from 'interfaces/season.interface';
import { IEpisode } from 'interfaces/episode.interface';

export interface IShow {
    remoteId: number;
    name: string;
    image: string;
    officialSite: string;
    premiere: Date;

    folder: string;
    alias: string;

    seasons: ISeason[];
    episodes: IEpisode[];
}

export interface IShowModel extends IShow, Document { }