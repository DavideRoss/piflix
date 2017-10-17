import { injectable } from 'inversify';

import * as Joi from 'joi';

@injectable()
export class ShowValidator {
    seachRemote(req, res, next) {
        const schema = Joi.object().keys({
            q: Joi.string().required()
        });

        let results = Joi.validate(req.query, schema, {
            abortEarly: false
        });

        if (results.error) {
            throw results.error;
        } else {
            next();
        }
    }

    importFromRemote(req, res, next) {
        const schema = Joi.object().keys({
            id: Joi.number().positive().required()
        });

        let results = Joi.validate(req.params, schema, {
            abortEarly: true
        });

        if (results.error) {
            throw results.error;
        } else {
            next();
        }
    }

    detectShow(req, res, next) {
        const schema = Joi.object().keys({
            id: Joi.string().required() // TODO: Validate for ObjectID
        });

        let results = Joi.validate(req.params, schema, {
            abortEarly: true
        });

        if (results.error) {
            throw results.error;
        } else {
            next();
        }
    }

    async detectSeasons(req, res, next) {
        const paramsSchema = Joi.object().keys({
            show: Joi.string().required(), // TODO: Validate for ObjectID
        });

        let paramsResult = Joi.validate(req.params, paramsSchema, {
            abortEarly: true
        });

        const bodySchema = Joi.object().keys({
            folder: Joi.string().required()
        });

        let bodyResult = Joi.validate(req.body, bodySchema, {
            abortEarly: true
        });

        // TODO: refactor multi object validation (external wrapper?)
        if (paramsResult.error || bodyResult.error) {
            throw paramsResult.error || bodyResult.error;
        } else {
            next();
        }
    }

    detectFiles(req, res, next) {
        const paramsSchema = Joi.object().keys({
            show: Joi.string().required(), // TODO: Validate for ObjectID
            season: Joi.string().required() // TODO: Validate for ObjectID
        });

        let paramsResult = Joi.validate(req.params, paramsSchema, {
            abortEarly: true
        });

        const bodySchema = Joi.object().keys({
            folder: Joi.string().required()
        });

        let bodyResult = Joi.validate(req.body, bodySchema, {
            abortEarly: true
        });

        // TODO: refactor multi object validation (external wrapper?)
        if (paramsResult.error || bodyResult.error) {
            throw paramsResult.error || bodyResult.error;
        } else {
            next();
        }
    }

    matchEpisodes(req, res, next) {
        // TODO: compile validation
        next();
    }

    rebuildPaths(req, res, next) {
        // TODO: compile validation
        next();
    }
}