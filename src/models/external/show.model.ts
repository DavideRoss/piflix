import { injectable } from 'inversify';

export interface ApiShowInstance {
    id: number;
    url: string;
    name: string;
    image: string;
    officialSite: string;
}

@injectable()
export class ApiShowFactory {
    parse(str: string): ApiShowInstance {
        try {
            let obj = JSON.parse(str);

            let out = {
                id: obj.id,
                url: obj.url,
                name: obj.name,
                officialSite: obj.officialSite,
                image: obj.image.original
            };

            return out as ApiShowInstance;
        } catch (ex) {
            throw ex;
        }
    }
}