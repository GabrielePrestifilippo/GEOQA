var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var users = require('./routes/users');
var dbConfig = require('./db/connection.js');

var app = express();


app.set('views', path.join(__dirname, 'views'));

app.use('/', express.static(__dirname + '/views/client'));
//set correct folders

app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));



app.use(cookieParser());

var mongoose = require('mongoose');
mongoose.connect(dbConfig.url);


// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'GEOQAKEY'}));

var initPassport = require('./passport/init');
initPassport(passport);

app.use(passport.initialize());
app.use(passport.session());
var flash = require('connect-flash');
app.use(flash());

var routes = require('./routes/index')(passport);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));





app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
