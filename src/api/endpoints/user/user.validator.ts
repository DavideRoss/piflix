import { injectable } from 'inversify';

import * as Joi from 'joi';

@injectable()
export class UserValidator {
    login(req, res, next) {
        const schema = Joi.object().keys({
            mail: Joi.string().required().email(),
            password: Joi.string().required()
        });

        let results = Joi.validate(req.body, schema, {
            abortEarly: false
        });

        if (results.error) {
            throw results.error;
        } else {
            next();
        }
    }
}