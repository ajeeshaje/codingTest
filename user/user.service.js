"use strict";

const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');

module.exports = {
    authenticate,
    register,
    verifyEmail
};

// user authentication
async function authenticate({ userName, password }) {
    const account = await db.userAccount.findOne({ userName });

    if (!account || !account.isVerified || !bcrypt.compareSync(password, account.passwordHash)) {
        throw 'Invalid UserName/Password';
    }

    // authentication successful so generate jwt and refresh tokens
    const token = generateJwtToken(account);

    // return basic details and tokens
    return {
        token,
        user: { ...getDetails(account) }
    };
}

// user registration
async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        // email already registered
        throw `${params.email} seems to be already registed.`;
    }

    if (await db.Account.findOne({ userName: params.userName })) {
        // userName already exists
        throw `${params.userName} seems to be already taken.`;
    }

    // create account object
    const account = new db.userAccount(params);

    account.verificationToken = getRandomTokenString();

    // hashing password
    account.passwordHash = generateHash(params.password);

    // saving account
    await account.save().catch((err) => {
        throw 'Failed to create the user.';
    });

    // send verificationemail
    await sendVerificationEmail(account, origin).catch((err) => {
        throw 'Failed to send Verification email.';
    });
}

// email verification
async function verifyEmail({ token }) {
    const account = await db.userAccount.findOne({ verificationToken: token });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = undefined;
    await account.save();
}

// hash the password
function generateHash(password) {
    return bcrypt.hashSync(password, 10);
}

// create a jwt token
function generateJwtToken(account) {
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '60m' });
}

// generate account verification token
function getRandomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

// getting the details to be sent in response
function getDetails(account) {
    const { id, userName, firstName, lastName, email } = account;
    return { id, userName, firstName, lastName, email };
}

// sending verification email
async function sendVerificationEmail(account, origin) {
    const verifyUrl = `${origin}/account/verify-email?token=${account.verificationToken}`;
    const message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    return await sendEmail({
        to: account.email,
        subject: 'User Verification Email',
        html: `<h4>Verify Email</h4>
               <p>Welcome!</p>
               ${message}`
    });
}

