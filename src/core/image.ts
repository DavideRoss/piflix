import { injectable } from 'inversify';

import * as fs from 'utils/promise-fs';
import * as request from 'request';
import { extname, join } from 'path';
import * as uuid from 'uuid/v4';

@injectable()
export class ImageProvider {
    public download(url, path): Promise<string> {
        return new Promise((resolve, reject) => {
            let name = uuid() + extname(url);
            let fullPath = join('files/images/', path);

            fs.mkdirp(fullPath).then(() => {
                request(url).pipe(fs.createWriteStream(join(fullPath, name)))
                    .on('close', () => resolve(name))
                    .on('error', () => reject());
            });
        });
    }
}