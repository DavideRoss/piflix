import { Document } from 'mongoose';

import { IShow } from 'interfaces/show.interface';
import { IEpisode } from 'interfaces/episode.interface';

export interface ISeason {
    remoteId: number;
    name: string;
    number: number;
    image: string;

    premiere: Date;
    end: Date;

    folder: string;
    alias: string;

    show: IShow;
    episodes: IEpisode[];
}

export interface ISeasonModel extends ISeason, Document { }