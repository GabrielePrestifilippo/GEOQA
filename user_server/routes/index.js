var express = require('express');
var router = express.Router();

module.exports = function (passport) {



    router.get('/', function (req, res) {
        res.render('client/index');
    });

    router.get('/login', function (req, res) {
        res.render('login', {message: req.flash('message')});
    });


    router.post('/login', passport.authenticate('login', {
        successRedirect: '/users/home',
        failureRedirect: '/',
        failureFlash: true
    }));


    router.get('/signup', function (req, res) {
        res.render('register', {message: req.flash('message')});
    });


    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/users/home',
        failureRedirect: '/signup',
        failureFlash: true
    }));

    return router;
}