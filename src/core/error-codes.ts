export enum ErrorCode {
    unauthorized,
    user_not_found,
    user_invalid_password,
    user_already_present,
    invalid_input_parameters,
    missing_mail_or_password,
    invalid_email,
    missing_email,
    missing_password,
    missing_external_api_connectivity,

    missing_show,
    missing_season,
    missing_episode,
    wrong_path_template
}

export interface IErrorCodeObject {
    code?: number;
    label: ErrorCode;
    message?: string;
    status: 400 | 401 | 403;
}

export class ApiError extends Error {
    errorCodeObject: IErrorCodeObject;

    constructor(code: ErrorCode) {
        if (!errorsMap.has(code)) {
            super('Invalid error code thrown');
        } else {
            const errorCodeObject = errorsMap.get(code);
            super(errorCodeObject.message);
            this.errorCodeObject = errorCodeObject;
        }

        // Restore prototype chain
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

const errorsMap: Map<ErrorCode, IErrorCodeObject> = new Map<ErrorCode, IErrorCodeObject>();

// ADDITIONALS

// 1999: field validation errors

const errors: IErrorCodeObject[] = [{
    code: 1003,
    label: ErrorCode.user_not_found,
    message: 'User not found',
    status: 401
}, {
    code: 1004,
    label: ErrorCode.user_invalid_password,
    message: 'Invalid password',
    status: 401
}, {
    code: 1101,
    label: ErrorCode.missing_mail_or_password,
    message: 'Missing mail or password',
    status: 400
}, {
    code: 1000,
    label: ErrorCode.missing_external_api_connectivity,
    message: 'Missing external API connectivity',
    status: 400
}, {
    code: 1201,
    label: ErrorCode.missing_show,
    message: 'Missing show',
    status: 400
}, {
    code: 1202,
    label: ErrorCode.missing_season,
    message: 'Missing season',
    status: 400
}, {
    code: 1203,
    label: ErrorCode.missing_episode,
    message: 'Missing episode',
    status: 400
}, {
    code: 1204,
    label: ErrorCode.wrong_path_template,
    message: 'Wrong path template',
    status: 400
}];

for (const error of errors) {
    errorsMap.set(error.label, error);
}
