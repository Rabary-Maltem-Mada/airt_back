var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Ticket = mongoose.model('Ticket');
var nodemailer = require('nodemailer');

// add New client

router.post('/add', function(req, res, next){
  console.log(JSON.stringify(req.body));
  var client = new Client();

  client.email = req.body.email;
  client.name = req.body.name;
  client.image = req.body.file;
  client.save().then(function(){
    return res.json({client: client.toJSONFor()});
  }).catch(next);
});

// return a client
router.get('/:id', function(req, res, next){
  console.log('req.params.idddddddddddddddd' , req.params.id);
  var client = new Client();
  Client.findById(req.params.id).then(function(client){
    if(!client){ return res.sendStatus(401); }
    return res.json({client: client.toJSONFor()});
  }).catch(next);
});

// update a client
router.put('/:id', function(req, res, next){
  console.log('req.params.idddddddddddddddd' , req.params.id);
  Client.findById(req.params.id).then(function(client){
    if(!client){ return res.sendStatus(401); }
    console.log('req.body.nameeeeeeeee', req.body.name)
    if(typeof req.body.name !== 'undefined'){
      client.name = req.body.name;
    }
    if(typeof req.body.email !== 'undefined'){
      client.email = req.body.email;
    }
    if(typeof req.body.image !== 'undefined'){
      client.image = req.body.image;
    }
    return client.save().then(function(){
      return res.json({client: client.toJSONFor()});
    });
    
  }).catch(next);
});

// delete a client
router.delete('/:id', function(req, res, next){
  Client.findById(req.params.id).then(function(client){
    if(!client){ return res.sendStatus(401); }
    return client.remove().then(function(){
      return res.sendStatus(204);
    })
  }).catch(next);
});

// return a list of clients
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
    subject: 'Rapport du ticket N° ' + data.body.refTicket,
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
