var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var temp = db.get('temp');
var qs = require('qs');
var mime = require('mime');

getAbc = function(str) {

   var re = /\|! /g
   var abc = str.replace(/(\|!)/g , '|\n')
  //  console.log(newAbc)
    return abc
}
// router.get('/abc', function(req, res, next) {
//   res.redirect('abc')
// })

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    unirest.get('https://facebook.com/[fb_user_id]?fields=picture.type(small)')
      .header('Authorization', 'Bearer ' + req.user.token)
      .header('x-li-format', 'json')
      .end(function (response) {
        // console.log(response);
        res.render('index', { profile: response.body });
      })
  } else {
    res.render('index', {  });
  }
  tunesDb.find({}, function (err, docs) {
    console.log(req.params)
    // not sure I need two res.renders
    res.render('index', { tunesDB: docs})
  });
});

router.post('/', function(req, res, next) {
  console.log('req.body from root', req.body)
  var tuneName = req.body.name // what is entered by user
  var tune = encodeURIComponent(tuneName)
  console.log('tune', tune)
  var tuneUrl = 'https://thesession.org/tunes/search?q=' + tune + '&format=json'
  console.log('tuneUrl', tuneUrl)

  // Get first unirest call to session.org with tune entered by user
    unirest.get(tuneUrl)
    .end(function (response) {
      console.log('response from unirest', response.body.tunes[0])

      _id = response.body.tunes[0]

      // Insert tune from user entry to database
      tunesDb.name    = tuneName[0]; // set the tunesdbid
      temp.insert(response.body.tunes[0], function (err, doc) {
        if (err) throw err
        var tuneOnly = doc
        console.log('tuneOnly', tuneOnly.abc)
        // console.log('abc from insert', response.body.tunes[0].abc)
      // 2nd unirest call to session.org to get key
        var tuneUrlKey = 'https://thesession.org/tunes/' + tuneOnly.id + '?format=json'
        unirest.get(tuneUrlKey)
        .end(function (response) {

            // Defining the 'M:' for displaying the meter
            if (response.body.type == 'jig')
              { response.body.time = '6/8' }
            else if (response.body.type == 'waltz')
              { response.body.time = '3/4' }
              else if (response.body.type == 'slip-jig')
                { response.body.time = '9/8' }
              else if (response.body.type == 'slide')
                { response.body.time = '12/8' }
                  else if (response.body.type == 'three-two')
                    { response.body.time = '3/2' }
                  else if (response.body.type == 'polka')
                    { response.body.time = '2/4' }
                    else  { response.body.time ='4/4' }

            // Get dynamic fields to include their initial state

            response.body.id = 'X: ' + response.body.id
            response.body.name = 'T: ' + response.body.name
            response.body.history = 'Z: ' + response.body.history
            response.body.time = 'M: ' + response.body.time
            response.body.length = 'L: 1/8'
            response.body.type = 'R: ' + response.body.type
            response.body.settings[0].key = 'K: ' + response.body.settings[0].key
            // console.log('abc from settings', response.body.settings[0].abc)
            // var newAbc = getAbc(response.body.settings[0].abc)
            // console.log('abc', newAbc)
            response.body.settings[0].abc = response.body.settings[0].abc.replace(/(\|!)/g , '|\n')


            response.body.settings[0].id = response.body.id
            response.body.settings[0].name = response.body.name
            response.body.settings[0].history = response.body.history
            response.body.settings[0].time = response.body.time
            response.body.settings[0].length = 'L: 1/8'
            response.body.settings[0].type = response.body.type

          console.log('time', response.body.time)
          console.log('history', response.body.history)
          console.log('length', response.body.length)
          console.log('res.locals', res.locals)
          console.log('happy')
          console.log('req.params', req.params)

          // inserting 2nd request into database
          tunesDb.insert(response.body.settings[0], function (err, doc) {
              if (err) throw err
              console.log('doc from update', doc)
              // res.render('tunes', doc)
              res.render('tunes', {tunesSessKey: response.body})
            })

          // redirect to new tunes route
          // res.redirect('/tunes?' + 'type=' + type)
          // in the tunes route you can read from the query params
          // req.query.type
        })
      })
    })
})

router.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/')
})

module.exports = router;
