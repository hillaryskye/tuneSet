var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var qs = require('qs');
var mime = require('mime');

router.get('/', function(req, res, next) {
  // getting key from user choice in keys.hbs
  reqKey = req.query.key
  reqId = req.query.name

  // Get ReqId & create a url for the search for a tune
  var keyQuery = req.query.key // what is entered by user
  var tuneKey = encodeURIComponent(keyQuery)
  var tuneKeyUrl = 'https://thesession.org/tunes/search?mode=' + tuneKey + '&format=json'
                    // 'https://thesession.org/tunes/search?type=&mode=Amajor&q=''
  // Call unirest for API if the key is not blank
    // Get first unirest call to session.org with tune entered by user
      console.log('tuneKeyURL from keys.js', tuneKeyUrl);
      unirest.get(tuneKeyUrl)
      .end(function (response) {
        console.log('response.body.tunes from keys.js', response.body.tunes);
        // Need to pass id from user clicking on a tune from keys.hbs
        // Got id from first unirest request from user's key choice
        id = response.body.tunes.reqId
        res.render('keys', {tuneKeys: response.body.tunes})
      })
      // res.redirect('/show', { {tuneKeys: response.body.tunes})
  })

module.exports = router;
