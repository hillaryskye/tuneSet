var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var qs = require('qs');



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
        res.render('tunes', { tunesSess: response.body.tunes[0]})
        console.log('id', response.body.tunes.id)

      // 2nd unirest call to session.org to get key
        var tuneUrlKey = 'https://thesession.org/tunes/' + tuneOnly.id + '?format=json'
        unirest.get(tuneUrlKey)
        .end(function (response) {
          key = response.body.settings[0].key
          console.log('res.locals', res.locals)
          console.log('key', response.body.settings[0])
          res.render('tunes', {tuneSessKey: response.body.settings[0]})
          console.log('happy')
          tunesDb.insert( response.body.settings[0], function (err, doc) {
              if (err) throw err
              console.log('doc from update', doc)
              res.render('tunes', doc)
            })
        })
      })
      // store the document in a variable
      // doc = tunesDb.findOne({_id})
      // console.log('doc', doc)
      // // set a new _id on the document
      // doc._id = ObjectId("4c8a331bda76c559ef000004")
      //
      // // insert the document, using the new _id
      // db.tunesDb.insert(doc)
      //
      // // remove the document with the old _id
      // db.tunesDb.remove({_id: ObjectId("4cc45467c55f4d2d2a000002")})


    // var key =

    router.get('/:id', function(req, res, next) {
      tunesDb.findOne({ _id: req.params.id }, function (err, doc) {
        if (err) throw err
        console.log('req.session', req.body)
        res.render('tunes', doc)
    })
      })

      router.get('/:id/edit', function(req, res, next) {
        tunesDb.findOne({ id: tuneOnly }, function (err, doc) {
        if (err) throw err
        res.render('tunes', doc)
      })
    })

      // router.get('/:id/update', function(req, res, next) {
          //   db.myusers.update(
          //   tunesDb.update({ id: tuneOnly }, function (err, doc) {
          //     if (err) throw err
          //     console.log('doc from update', doc)
          //     // res.redirect('')
          //   })
          // })


    })
})



router.get('/tunes', function(req, res, next) {
  console.log('req.body.name from /tunes', tuneName)
  // var TUNE_NAME, req.body to uri
})

router.post('/tunes', function(req, res, next) {
  res.redirect('/')
})

// router.post('/tunes', function(req, res, next) {
//   // var TUNE_NAME, req.body to uri
//   var tune = unirest.get('https://thesession.org/tunes/search?q=drowsy%20maggie')
//     .end(function (response) {
//       console.log('req.body', req.body)
//       console.log('tune', tune)
//       res.render('tunes', {profile: response.body})
//     })
// })

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/')
})

module.exports = router;
