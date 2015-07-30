var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('dotenv').load()
var session = require('express-session');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var routes = require('./routes/index');
var users = require('./routes/users');
var keys = require('./routes/keys');
var tunes = require('./routes/tunes')
// var show = require('./routes/show');
var client = require('./public/javascripts/client');
var unirest = require('unirest');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.HOST + '/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    // console.log(profile)
    done(null, {id: profile.id, displayName: profile.displayName, token: accessToken, profileURL: profile.profileUrl})
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, {id: profile.id, displayName: profile.displayName, token: accessToken, profileURL: profile.profileUrl});
    });
  }
));

var app = express();

app.set('trust proxy', 1)

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: 'foo bar', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// app.get('/tunes', function(req, res) {
//   var TUNE_NAME = 1;
//     unirest.get('https://thesession.org/tunes/' + TUNE_NAME + '?format=json')
//     // unirest.get('https://thesession.org/tunes/1?format=json')
//       .end(function (response) {
//         console.log(response.body.name);
//         // console.log('res', response)
//
//         res.end('Done')
//       })
// })

// app.get('/', function(req, res){
//    if(!req.user){
//     console.log('no login');
//   }else{
//     console.log('si login');
//   }
//   res.render('index', { user: req.user });
// });

// app.get('/logout', function(req, res){
//   res.render('logout', { user: req.user });
// });

// GET /auth/facebook
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Facebook authentication will involve
//   redirecting the user to facebook.com.  After authorization, Facebook will
//   redirect the user back to this application at /auth/facebook/callback
app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

passport.serializeUser(function(user, done) {
  console.log(user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log('obj', obj);
  done(null, obj);
});

app.use(function (req, res, next) {
  res.locals.user = req.user
  app.locals.pretty = true
  next()
})

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

app.use('/', routes);
app.use('/users', users);
app.use('/keys', keys);
app.use('/tunes', tunes);
// app.use('/show', show);
app.get('/styleguide', function(req, res){
  res.render('styleguide');
})

// app.use(function(req, res, next) {
//
// })

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
