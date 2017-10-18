import * as _ from 'lodash';
import { resolve } from 'path';
import { checkExist } from 'utils/promise-fs';

import { injectable } from 'inversify';

const defaultConf = {
    debug: {
        sendErrorsToClient: true,
        sendStackToClient: true
    },

    external: {
        api: 'http://api.tvmaze.com',
        provider: 'tvmaze'
    },

    files: {
        base: resolve(__dirname + '/../../../files')
    },

    http: {
        port: 1337
    },

    log: {
        http: true,
        level: 'debug',
        timestamp: true,
    },

    mongo: {
        database: 'piflix',
        host: 'localhost',
        password: null,
        user: null
    },

    test: {
        mongo: {
            database: 'piflix-test',
            host: 'localhost',
            password: null,
            user: null
        }
    },

    token: {
        expiration: 2000000
    }
};

@injectable()
export class Configuration {
    log: {
        timestamp: boolean;
        level: string;
        http: boolean;
    };

    mongo: {
        user: string;
        password: string;
        host: string;
        database: string;
    };

    http: {
        port: number
    };

    token: {
        expiration: number;
    };

    test: {
        mongo: {
            user: string;
            password: string;
            host: string;
            database: string;
        };
    };

    debug: {
        sendStackToClient: boolean;
        sendErrorsToClient: boolean;
    };

    files: {
        base: string;
    };

    external: {
        provider: string;
        api: string
    };

    constructor() {
        this.setConfiguration();

        // TODO: load configuration from env/cmd line arguments

        // Check files.base folder existence
        checkExist(this.files.base).catch(() => {
            throw Error('Missing local file folder');
        });
    }

    setConfiguration(conf: object = {}) {
        const c = _.merge(defaultConf, conf);
        Object.assign(this, c);
    }
}
