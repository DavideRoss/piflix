let crypto = require('crypto');
let fs = require('fs');
let path = require('path');

let BASE = 'files/Game of Thrones/Game of Thrones S05 Complete Season 5 720p WEB-DL DD5.1 x264-PSYPHER';

let files = fs.readdirSync(path.resolve(BASE));

Promise.all(files.map(e => {
    return new Promise((resolve, reject) => {
        let hash = crypto.createHash('md5');
        let stream = fs.createReadStream(BASE + '/' + e);

        stream.on('data', (data) => {
            console.log(`[${e}] Data received`);
            hash.update(data, 'utf8');
        });

        stream.on('end', () => {
            fs.writeFileSync(BASE + '/' + e + '.txt', hash.digest('hex'));
            console.log(`[${e}] File wrote`);
            resolve();
        });
    });
})).then(() => {
    console.log('DONE!');
});
