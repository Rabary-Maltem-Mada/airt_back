var router = require('express').Router();
var mongoose = require('mongoose');
var multer = require('multer');   //FOR FILE UPLOAD
var auth = require('../auth');
var User = mongoose.model('User');
var Comment = mongoose.model('Comment');
const userFiles = './public/uploads/';
const fs = require('fs');



router.put('/files', (req, res) => {
  const file = req.body;
  const base64data = file.content.replace(/^data:.*,/, '');
  fs.writeFile(userFiles + file.name, base64data, 'base64', (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.set('Location', userFiles + file.name);
      res.status(200);
      res.send(file);
    }
  });
 });

 router.delete('/files/**', (req, res) => {
  const fileName = req.url.substring(7).replace(/%20/g, ' ');
  fs.unlink(userFiles + fileName, (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.status(204);
      res.send({});
    }
  });
 });



module.exports = router;
