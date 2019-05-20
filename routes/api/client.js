var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Ticket = mongoose.model('Ticket');
var nodemailer = require('nodemailer');

// return a list of tags
router.get('/', async function(req, res, next) {
  Client.find().sort({name: 1 }).then(function(client){
    var clients = JSON.parse(JSON.stringify(client));
    /*const asyncFetchTicket = clients.map((cl) => Ticket.find({client: cl._id}));

    Promise.all(asyncFetchTicket).then((data) => {
      
    });*/

    const listAsync = clients.map(cl => {
      // get all ticket for each client
      return Ticket.find({client: cl._id}).then(function(ticlient){
        cl.Tickets = ticlient;
        return cl;
      })
    })

    Promise.all(listAsync).then((data) => {
      return res.json({clients: data});
    }); 

  }).catch(next);
});


router.post('/sendMail', function(req, res, next) {
  var transporter = nodemailer.createTransport('smtps://rbrstart%40gmail.com:start0001@smtp.gmail.com');
  var data = req.body;
  console.log('Email sent by', data.body.contactName);
  var mailOptions = {
    from: data.body.contactEmail,
    to: 'rabary@passion4humanity.com',
    subject: 'Email sent by ' + data.body.contactName,
    html: data.body.contactMessage
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
    console.log('Data:' + data.contactName);
  });
  res.json(data);
});

module.exports = router;
