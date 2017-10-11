import { Document } from 'mongoose';
import { ISeason } from 'interfaces/season.interface';

export interface IShow {
    remoteId: number;
    name: string;
    image: string;
    officialSite: string;

    folder: string;

    seasons: ISeason[];
}

export interface IShowModel extends IShow, Document { }