var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Ticket = mongoose.model('Ticket');
var nodemailer = require('nodemailer');
var event = mongoose.model('Event')

// add New event to database

router.post('/add', function(req, res, next){
  console.log('Event Handler NodeJS');
});

module.exports = router;
