var router = require('express').Router();
var mongoose = require('mongoose');
var Ticket = mongoose.model('Ticket');

// return a list of tags
router.get('/', function(req, res, next) {
  Ticket.find().distinct('tagList').then(function(tags){
    console.log('taggggggggggggggggggggggggg', tags);
    return res.json({tags: tags});
  }).catch(next);
});

module.exports = router;
