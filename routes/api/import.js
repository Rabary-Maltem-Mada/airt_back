var router = require('express').Router();
var mongoose = require('mongoose');
const fs = require('fs'); 
var Ticket = mongoose.model('Ticket');
var User = mongoose.model('User');
var csv = require('fast-csv');

// return a list of tags
router.post('/ticket', async function(req, res, next) {
    if (!req.body) {return res.status(400).send('No files were uploaded.');}

    var file = req.body.body.file;
    var filename = req.body.body.filename;
    var tickets = [];

    var fileToRead = new Buffer(file, 'base64');

    csv
    .fromString(fileToRead.toString(), {
        headers: true,
        ignoreEmpty: true
    })
    .on("data", function(data){
        data['_id'] = new mongoose.Types.ObjectId();
        tickets.push(data);
        var ticket = new Ticket(data);
        ticket.save().then(function(author){
            //    if (err) {throw err};
            console.log('icccciiiiiiiiiiiiiiiii',)
        })
    })
    .on("end", function(){
        console.log(tickets)
       var ticket = new Ticket();
       ticket.save().then(function(author){
        //    if (err) {throw err};
           console.log('icccciiiiiiiiiiiiiiiii', tickets.length)
           res.send(tickets.length + ' authors have been successfully uploaded.');
        })
    });
});
router.post('/user', async function(req, res, next) {
    if (!req.body) {return res.status(400).send('No files were uploaded.');}

    var file = req.body.body.file;
    var filename = req.body.body.filename;
    var users = [];

    var fileToRead = new Buffer(file, 'base64');
    try {
        csv
        .fromString(fileToRead.toString(), {
            headers: true,
            ignoreEmpty: true
        })
        .on("data", function(data){
            const res = {};
            res['_id'] = new mongoose.Types.ObjectId();
            Object.keys(data).map(keys => {
                const data_values = data[keys].split(';');
                const data_keys = keys.split(';');
                const length = data_keys.length;
    
                for(let i = 0; i < length; i++) {
                    res[data_keys[i]] = data_values[i] ? data_values[i] : null;
                }
            });
    
            console.log("data object res.email ===> ", res.email);
            users.push(res);
            var user = new User();
            user.email = res.email;
            user.username = res.username;
            user.save().then(function(author){
                   if (err) {throw err};
            }).catch(err => {console.log(err)})
        })
        .on("end", function(){
           var user = new User();
           user.save().then(function(user, err){
               if (err) {throw err};
               res.send(users.length + ' authors have been successfully uploaded.');
            }).catch(err => {console.log(err)})
        });
      } catch (e) {
        console.log(e)
      }

});
module.exports = router;
