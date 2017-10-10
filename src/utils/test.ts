import { Configuration } from 'core/config';
import { InversifyContainer } from 'core/inversify';

import { Db } from 'core/db';
import { Api } from 'api/api';

export interface TestGlobals {
    db: Db;
    url: string;
    api: Api;
}

export async function init_e2e(): Promise<TestGlobals> {
    let conf: Configuration = new Configuration();

    conf.mongo = conf.test.mongo;

    let backendConfig = InversifyContainer.get<Configuration>(Configuration);
    backendConfig.setConfiguration(conf);

    let server = InversifyContainer.get<Api>(Api);
    await server.setup();
    await server.listen();

    return {
        db: InversifyContainer.get<Db>(Db),
        url: `http://localhost:${backendConfig.http.port}/`,
        api: server
    };
}