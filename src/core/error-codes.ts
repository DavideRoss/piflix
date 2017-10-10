export enum ErrorCode {
    unauthorized,
    user_not_activated,
    user_not_found,
    user_invalid_password,
    user_already_present,
    invalid_input_parameters,
    missing_mail_or_password,
    invalid_email,
    missing_email,
    missing_password
}

export interface ErrorCodeObject {
    code?: number;
    label: ErrorCode;
    message?: string;
    status: 400 | 401 | 403;
}

export class ApiError extends Error {
    errorCodeObject: ErrorCodeObject;

    constructor(code: ErrorCode) {
        if (!errorsMap.has(code)) {
            super('Invalid error code thrown');
        } else {
            let errorCodeObject = errorsMap.get(code);
            super(errorCodeObject.message);
            this.errorCodeObject = errorCodeObject;
        }

        // Restore prototype chain
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

let errorsMap: Map<ErrorCode, ErrorCodeObject> = new Map<ErrorCode, ErrorCodeObject>();

// ADDITIONALS

// 1999: field validation errors

let errors: ErrorCodeObject[] = [{
    code: 1002,
    label: ErrorCode.user_not_activated,
    message: 'User not activated',
    status: 401
}, {
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
}];

for (let error of errors) {
    errorsMap.set(error.label, error);
}