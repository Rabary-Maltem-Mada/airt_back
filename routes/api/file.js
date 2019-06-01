var router = require('express').Router();
var mongoose = require('mongoose');
var Client = mongoose.model('Client');
var Ticket = mongoose.model('Ticket');

var http = require('http'),
    fs = require('fs'),
    url = require('url');

// return a list of tags
router.get('/:img', async function(req, res, next) {

var pic = url.parse(req.url,true).path;
    //read the image using fs and send the image content back in the response
    fs.readFile('./public/uploads' + pic, function (err, content) {
        if (err) {
            res.writeHead(400, {'Content-type':'text/html'})
            console.log(err);
            res.end("No such image");    
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200,{'Content-type':'image/jpg'});
            console.log('the fiiiiiiiile', content);
            res.end(content);
        }
    });
});

module.exports = router;
