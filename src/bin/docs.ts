import * as express from 'express';
import * as http from 'http';
import * as basicAuth from 'express-basic-auth';
import * as path from 'path';

let app = express();
let port = process.env.PORT || 8080;

let auth = basicAuth({
    users: {
        user: 'password2017!'
    },
    challenge: true,
    realm: 'VszQJWUsb9'
});

app.use(express.static(path.join(__dirname, '../../../docs/api/')));

app.listen(port, () => {
    console.log(`Docs HTTP server listening on port ${port}`);
});
