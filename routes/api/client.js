var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Ticket = mongoose.model('Ticket');

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

module.exports = router;
