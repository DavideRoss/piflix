import { injectable } from 'inversify';

import { extname, join } from 'path';
import * as request from 'request';
import * as fs from 'utils/promise-fs';
import * as uuid from 'uuid/v4';

@injectable()
export class ImageProvider {
    // TODO: resize image based on type
    public download(url, path): Promise<string> {
        return new Promise((resolve, reject) => {
            const name = uuid() + extname(url);
            const fullPath = join('files/images/', path);

            fs.mkdirp(fullPath).then(() => {
                request(url).pipe(fs.createWriteStream(join(fullPath, name)))
                    .on('close', () => resolve(name))
                    .on('error', () => reject());
            });
        });
    }
}
