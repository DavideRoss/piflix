require('app-module-path').addPath(__dirname + '/../');
import 'reflect-metadata';

import { Logger } from 'core/log';
import { Configuration } from 'core/config';
import { InversifyContainer } from 'core/inversify';

import { Api } from 'api/api';

import * as errorHandler from 'utils/error-handling';

let log: Logger;
log = InversifyContainer.get<Logger>(Logger);

process.on('unhandledRejection', handleRejections.bind(this));
process.on('uncaughtException', handleRejections.bind(this));

(async() => {
    let server = InversifyContainer.get<Api>(Api);
    await server.setup();
    server.listen();
})();

function handleRejections(err) {
    errorHandler.handleRejections(err, log);
}