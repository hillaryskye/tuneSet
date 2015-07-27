var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var qs = require('qs');
var mime = require('mime');

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
      console.log('_id', _id)

      // Insert tune from user entry to database
      tunesDb.name    = tuneName[0]; // set the tunesdbid
      tunesDb.insert(response.body.tunes[0], function (err, doc) {
        console.log('req.body.id from tunes.insert', req.body)
        if (err) throw err
        var tuneOnly = doc
        console.log('tuneOnly', tuneOnly.id)

        // first render
        // res.render('tunes', { tunesSess: response.body.tunes[0]})
        console.log('id', response.body.tunes.id)

      // 2nd unirest call to session.org to get key
        var tuneUrlKey = 'https://thesession.org/tunes/' + tuneOnly.id + '?format=json'
        unirest.get(tuneUrlKey)
        .end(function (response) {
          key = response.body.settings[0].key

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


          console.log('time', response.body.time)
          console.log('res.locals', res.locals)
          console.log('key', response.body)
          console.log('happy')
          console.log('req.params.name', req.params)
          tunesDb.insert( response.body.settings[0], function (err, doc) {
              if (err) throw err
              console.log('doc from update', doc)
              // res.render('tunes', doc)
            })
          res.render('tunes', {tunesSessKey: response.body, key: response.body.settings[0].key})
        })
      })
    })
})

router.get('/:id', function(req, res, next) {
  tunesDb.findOne({ _id: req.params.id }, function (err, doc) {
    if (err) throw err
    console.log('req.session', req.body)
    res.render('tunes', doc)
    })
  })

router.get(':/id/add', function(req, res, next) {
  console.log('res', res)
  res.render('tunes', {})
})
// This route is where user adds tunes by keys
  router.get('/:id/edit', function(req, res, next) {
    tunesDb.findOne({ _id: req.params.id }, function (err, doc) {
    if (err) throw err
    res.render('tunes/add', doc)
  })
})

  router.post('/:id/delete', function(req, res, next) {
    tunesDB.remove({ _id: req.params.id }, function (err, docs) {
      if (err) throw err
      res.redirect('tunes/add')
    })
  })

  router.post('/:id/update', function(req, res, next) {
    tunesDb.update({ _id: req.params.id }, function (err, doc) {
      if (err) throw err
      console.log('doc from update', doc)
      res.redirect('tunes/add')
    })
  })

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/')
})

module.exports = router;
