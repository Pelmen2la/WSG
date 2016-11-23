'use strict';

var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    expressSession = require('express-session');

module.exports = function (app) {
    app.use(express.static(path.join(__dirname, '..', 'public')));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(expressSession({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    }));
};