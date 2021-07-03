"use strict";

const config   = require('config.json');
const logger   = require('../_utils/logger');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions).
catch(err => { 
    logger.error(`${500} - ${err}`);
    throw `${err}`; 
});

module.exports = {
    userAccount: require('user/user.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}