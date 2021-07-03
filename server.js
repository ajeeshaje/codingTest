"use strict";

require('rootpath')();
const express = require('express');
const logger = require('./_utils/logger');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('_middleware/error-handler');

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// allow cors requests from any origin
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use(helmet());

app.get('/', (req, res) => {
    res.send("It's Working!");
    logger.info("It's Working!");
})

// api routes
app.use('/user', require('./user/user.controller'));

// error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 3000;
app.listen(port, () => {
    logger.info(`Server listening on port: ${port}`);
});

module.exports = app;
