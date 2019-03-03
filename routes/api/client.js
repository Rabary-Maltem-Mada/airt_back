var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');

// return a list of tags
router.get('/', function(req, res, next) {
  Client.find().sort({name: 1 }).then(function(client){
    return res.json({clients: client});
  }).catch(next);
});

module.exports = router;
