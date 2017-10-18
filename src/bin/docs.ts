import * as express from 'express';
// import * as basicAuth from 'express-basic-auth';
import * as path from 'path';

const app = express();
const port = process.env.PORT || 8080;

// const auth = basicAuth({
//     challenge: true,
//     realm: 'VszQJWUsb9',
//     users: {
//         user: 'password2017!'
//     }
// });

app.use(express.static(path.join(__dirname, '../../../docs/api/')));

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Docs HTTP server listening on port ${port}`);
});
