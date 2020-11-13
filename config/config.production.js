/* eslint-env node */
'use strict';

const config = require('./config.default'),
    validateConfig = require('webgme/config/validator');
const path = require('path');


const publicKeyPath = process.env.DEPLOYMENT_PUBLIC_KEY || path.join(__dirname, '..', '..', 'token_keys', 'public_key');
const privateKeyPath = process.env.WEBGME_PRIVATE_KEY || path.join(__dirname, '..', '..', 'token_keys', 'private_key');

config.authentication.enable = true;
config.authentication.allowGuests = false;
config.authentication.allowUserRegistration = true;
config.authentication.jwt.publicKey = publicKeyPath;
config.authentication.jwt.privateKey = privateKeyPath;

config.executor.authentication.enable = true;
config.executor.authentication.allowGuests = false;

config.authentication.logInUrl = '/profile/login';
config.authentication.logOutUrl = '/profile/login';


validateConfig(config);
module.exports = config;
