import * as _ from 'lodash';
import { checkExist } from 'utils/promise-fs';
import { resolve } from 'path';

import { injectable } from 'inversify';

let defaultConf = {
    log: {
        timestamp: true,
        level: 'debug',
        http: true
    },

    mongo: {
        host: 'localhost',
        user: null,
        password: null,
        database: 'piflix'
    },

    http: {
        port: 1337
    },

    token: {
        expiration: 2000000
    },

    test: {
        mongo: {
            host: 'localhost',
            user: null,
            password: null,
            database: 'piflix-test'
        }
    },

    debug: {
        sendStackToClient: true,
        sendErrorsToClient: true
    },

    files: {
        base: resolve(__dirname + '/../../../files')
    },

    remote: {
        provider: 'tvmaze',
        api: 'http://api.tvmaze.com'
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

    setConfiguration(conf: Object = {}) {
        let c = _.merge(defaultConf, conf);
        Object.assign(this, c);
    }
}