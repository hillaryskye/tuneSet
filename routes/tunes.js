require('dotenv').load();
var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var qs = require('qs');
var mime = require('mime');

router.get('/show', function(req, res, next) {
  console.log('line 11');
  tunesDb.find({}, function (err, docs) {
    if (err) throw err
    // console.log('req.session', req.body)
    //console.log('doc from show page', docs)
    res.render('show', {tunes: docs})
    })
  })

  router.get('/', function(req, res, next) {
    console.log('line 21');

    var reqKey = req.query.id
    var tuneUrlKeyId = 'https://thesession.org/tunes/' + reqKey + '?format=json'

  unirest.get(tuneUrlKeyId)
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
    response.body.settings[0].abc = response.body.settings[0].abc

    response.body.settings[0].id = response.body.id
    response.body.settings[0].name = response.body.name
    response.body.settings[0].history = response.body.history
    response.body.settings[0].time = response.body.time
    response.body.settings[0].length = 'L: 1/8'
    response.body.settings[0].type = response.body.type

    console.log('req.query.name from inside 2nd unirest', req.query.name)
    console.log('time in tunes.js', response.body.settings[0].time)
    var foo = response.body.settings[0]
    console.log('foo', foo)
    tunesDb.insert(response.body.settings[0], function (err, doc) {
        if (err) throw err
        console.log('doc from update', doc)
        res.redirect('/tunes/show')
        // res.render('tunes', doc)
      })
      console.log('after')
  })
})

module.exports = router;
