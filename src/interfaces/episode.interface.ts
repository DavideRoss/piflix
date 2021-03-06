import { Document } from 'mongoose';

import { ISeason } from 'interfaces/season.interface';
import { IShow } from 'interfaces/show.interface';

export interface IEpisode {
    remoteId: number;
    name: string;
    number: number;
    date: Date;
    runTime: number;
    summary: string;
    image: string;

    file: string;
    alias: string;

    show: IShow;
    season: ISeason;
}

export interface IEpisodeModel extends IEpisode, Document { }
