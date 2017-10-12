import { injectable } from 'inversify';

import * as request from 'request';
import * as fs from 'utils/promise-fs';

@injectable()
export class ImageProvider {
    public download(url): Promise<string> {
        return new Promise((resolve, reject) => {
            // TODO: add dynamic filename
            request(url).pipe(fs.createWriteStream('f.png'))
                .on('close', () => resolve('f.png'))
                .on('error', () => reject());
        });
    }
}