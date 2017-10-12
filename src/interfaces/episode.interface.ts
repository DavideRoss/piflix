import { Document } from 'mongoose';

import { IShow } from 'interfaces/show.interface';
import { ISeason } from 'interfaces/season.interface';

export interface IEpisode {
    remoteId: number;
    name: string;
    number: number;
    date: Date;
    runTime: number;
    summary: string;
    image: string;

    file: string;

    show: IShow;
    season: ISeason;
}

export interface IEpisodeModel extends IEpisode, Document { }