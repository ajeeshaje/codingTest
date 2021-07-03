"use strict";

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const userService = require('./user.service');

// routes
router.post('/login', authenticateSchema, authenticate);
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);


module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        userName: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    const { userName, password } = req.body;
    userService.authenticate({ userName, password })
        .then(({ ...account }) => {
            res.json(account);
        })
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        userName: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    userService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check the verification email send to your email' }))
        .catch(next);
}

function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
    userService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verification successful, login is enabled' }))
        .catch(next);
}