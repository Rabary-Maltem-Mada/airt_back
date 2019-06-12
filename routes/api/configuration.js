var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Ticket = mongoose.model('Ticket');
var Configuration = mongoose.model('Configuration');
var event = mongoose.model('Event')

// add New event to database

router.get('/', function(req, res, next){
  console.log('Get all configuration');
});

router.post('/add', function(req, res, next){
    console.log(req.body);
    var config = new Configuration();
    config.logo = req.body.configuration.logo;
    config.email = req.body.configuration.email;
    config.couleur1 = req.body.configuration.couleur1;
    config.couleur2 = req.body.configuration.couleur2;
    config.save().then(function(config){
        res.json(config)
    })
});
  

module.exports = router;
