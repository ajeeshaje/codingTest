"use strict";

const logger   = require('../_utils/logger');
module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    switch (true) {
        case typeof err === 'string':
            // application error
            const notFound = err.toLowerCase().endsWith('not found');
            const statusCode = notFound ? 404 : 400;
            logger.error(`${statusCode} - ${req?.originalUrl} - ${req?.method} - ${err}`);
            return res.status(statusCode).json({ message: err });
        case err?.name === 'ValidationError':
            // validation error
            logger.error(`${400} - ${req?.originalUrl} - ${req?.method} - ${err}`);
            return res.status(400).json({ message: err?.name });
        case err?.name === 'UnauthorizedError':
            // jwtToken authentication error
            logger.error(`${401} - ${req?.originalUrl} - ${req?.method} - ${err}`);
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            logger.error(`${500} - ${req?.originalUrl} - ${req?.method} - ${err}`);
            return res.status(500).json({ message: err?.name });
    }
}