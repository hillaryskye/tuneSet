var express = require('express');
var router = express.Router();
var unirest = require('unirest');
var db = require('monk')(process.env.MONGOLAB_URI);
var tunesDb = db.get('tunes');
var qs = require('qs');
var mime = require('mime');

console.log('hello from show')
// router.get('/new', function(req, res, next) {
//   tunesDb.insert({ _id: req.params.id }, function (err, doc) {
//         if (err) throw err
//         // console.log('doc from update', doc)
//         res.render('show', {tunesDB: doc})
//       })
//   })
//
// // This route is where user adds tunes by keys
//   router.get('/:id/edit', function(req, res, next) {
//     tunesDb.findOne({ _id: req.params.id }, function (err, doc) {
//     if (err) throw err
//     res.render('show/edit', doc)
//   })
// })
//
//   router.post('/:id/delete', function(req, res, next) {
//     tunesDB.remove({ _id: req.params.id }, function (err, docs) {
//       if (err) throw err
//       res.redirect('/show')
//     })
//   })
//
//   router.post('/:id/update', function(req, res, next) {
//     tunesDb.update({ _id: req.params.id }, function (err, doc) {
//       if (err) throw err
//       // console.log('doc from update', doc)
//       res.redirect('/show')
//     })
//   })

  // router.get('/', function(req, res, next) {
  //   tunesDb.find({}, function (err, doc) {
  //     if (err) throw err
  //     // console.log('req.session', req.body)
  //     console.log('doc from show page', doc)
  //     res.render('show', doc)
  //     })
  //   })

module.exports = router;
