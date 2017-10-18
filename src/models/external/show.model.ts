import { injectable } from 'inversify';

export interface IApiShow {
    id: number;
    url: string;
    name: string;
    image: string;
    officialSite: string;
}

@injectable()
export class ApiShowFactory {
    parse(str: string): IApiShow {
        try {
            const obj = JSON.parse(str);

            const out = {
                id: obj.id,
                image: obj.image.original,
                name: obj.name,
                officialSite: obj.officialSite,
                url: obj.url
            };

            return out as IApiShow;
        } catch (ex) {
            throw ex;
        }
    }
}
