var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var qs = require('qs');
var mime = require('mime');

router.get('/', function(req, res, next) {
  // getting key from user choice in keys.hbs
  var reqKey = req.query.key
  var reqId = req.query.name
  var reqType = req.query.type

  // Get ReqId & create a url for the search for a tune
  var typeQuery = req.query.type
  var keyQuery = req.query.key // what is entered by user
  var tuneKey = encodeURIComponent(keyQuery)
  var tuneKeyUrl = 'https://thesession.org/tunes/search?mode=' + tuneKey + '&format=json'
  // Call unirest for API if the key is not blank
    // Get first unirest call to session.org with tune entered by user
      console.log('tuneKeyURL from keys.js', tuneKeyUrl);
      unirest.get(tuneKeyUrl)
      .end(function (response) {
        console.log('response.body.tunes from keys.js', response.body.tunes);
        // Need to pass id from user clicking on a tune from keys.hbs
        // Got id from first unirest request from user's key choice
        response.body.tunes.type = reqType
        response.body.tunes.key = reqKey
        console.log('reqKey', reqKey)
        console.log('reqType', reqType)
        console.log('response.body.tunes.key', response.body.tunes.key)
        id = response.body.tunes.reqId
        res.render('keys', {tuneKeys: response.body.tunes, key: response.body.tunes.key})
      })
      // res.redirect('/show', { {tuneKeys: response.body.tunes})
  })

module.exports = router;
