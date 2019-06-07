var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');
const util = require('util');
const async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

router.get('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});

// get One User
router.get('/user/:id', auth.required, function(req, res, next){
  // console.log('req.params', req.params)
  User.findById(req.params.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    return res.json({user: user.toEditJSON()});
  }).catch(next);
});

// Delete user
router.delete('/user/:id', function(req, res, next){
  User.findById(req.params.id).then(function(user){
    if(!user){ return res.sendStatus(401); }
    return user.remove().then(function(){
      return res.sendStatus(204);
    })
  }).catch(next);
});

router.get('/users', auth.required, function(req, res, next){
  User.find({}).then(function(user){
    if(!user){ return res.sendStatus(401); }
    let population = [];
    user.forEach(element => {
      population.push(element.toTicketJSON());
      });
    return res.json({
      user: population
    });
  }).catch(next);
});

router.put('/user', auth.required, function(req, res, next){
  User.findById(req.payload.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.bio !== 'undefined'){
      user.bio = req.body.user.bio;
    }
    if(typeof req.body.user.image !== 'undefined'){
      user.image = req.body.user.image;
    }
    if(typeof req.body.user.cover !== 'undefined'){
      user.cover = req.body.user.cover;
    }
    if(typeof req.body.user.password !== 'undefined'){
      user.setPassword(req.body.user.password);
    }
    return user.save().then(function(){
      return res.json({user: user.toAuthJSON()});
    });
  }).catch(next);
});

// Update user one by one
router.put('/userUpdate', auth.required, function(req, res, next){
  User.findById(req.body.user.id).then(function(user){
    if(!user){ return res.sendStatus(401); }

    // only update fields that were actually passed...
    if(typeof req.body.user.username !== 'undefined'){
      user.username = req.body.user.username;
    }
    if(typeof req.body.user.email !== 'undefined'){
      user.email = req.body.user.email;
    }
    if(typeof req.body.user.role !== 'undefined'){
      user.role = req.body.user.role;
    }

    return user.save().then(function(){
      return res.json({user: user.toTicketJSON()});
    });
  }).catch(next);
});

router.post('/users/login', function(req, res, next){
  if(!req.body.user.email){
    return res.status(422).json({errors: {email: "can't be blank"}});
  }

  if(!req.body.user.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
  }

  passport.authenticate('local', {session: false}, function(err, user, info){
    if(err){ return next(err); }

    if(user){
      user.token = user.generateJWT();
      return res.json({user: user.toAuthJSON()});
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.post('/users', function(req, res, next){
  console.log(JSON.stringify(req.body));
  var user = new User();

  user.username = req.body.user.username;
  user.email = req.body.user.email;
  user.role = req.body.user.role;
  user.setPassword(req.body.user.password);
  user.save().then(function(){
    return res.json({user: user.toAuthJSON()});
  }).catch(next);
});


router.post('/users/check', function(req, res, next) {
  console.log('req.body.email', req.body.email)
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return res.json({errors: "No account with that email address exists."});
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var transporter = nodemailer.createTransport('smtps://rbrstart%40gmail.com:start0001@smtp.gmail.com');
      // var data = req.body;
      // console.log('Email sent by', data.body.contactName);
      var mailOptions = {
        to: 'rabary@passion4humanity.com',
        from: 'passwordreset@tiketi.com',
        subject: 'Reinitialisation mot de passe',
        html:  
        `
            <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
            <html lang="en">
              <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>AfroEgypt</title>  
              </head>
              <body style="margin:0; padding:0;">
                <center>
                  <table width="50%" border="0" cellpadding="0" cellspacing="0" bgcolor="#F2F2F2">
                      <th height="50px" bgcolor="#0c8b42" style="font-size:20px;color: #fbbb0d">
                      AFROEGYPT
                          <td align="center" valign="top">
                            
                          </td>
                      </th>
                      <tr style="padding: 20px 0;">
                          <td align="center" valign="top">
                          <h2>Cher collaborateur,</h2>
                          <p>Ce mail est envoyé pour vous permettre<br>de changer votre mot de passe</p>

                          <p>Cliquez sur le lien pour acceder à la page de reinitialisation de votre mot de passe<br>ou copier et coller dans votre navigateur</p>
                          <br>
                          <a target ="_blank"href="http://`+ req.headers.host +`'/api/reset/' `+ token +`" style="font-size:15px;color:#0c8b42;background-color: #ffffff; text-decoration:underline;padding:10px;" target="_blank">`+
                          'http://' + req.headers.host + '/api/reset/' + token + '\n\n' +`</a>
                          <br>
                          <p style="padding-top: 10px;font-size: 8px;">Ce lien sera expiré dans 30mn.</p>
                          <p>Si vous n'avez pas lancé cet action, veuillez simplement ignorer ce message. </p>
                          <p>Nous vous remerçions pour votre confiance.</p>
                          </td>
                      </tr>
                  </table>
                  <table border="0" cellpadding="0" cellspacing="0" width="50%" id="emailFooter" bgcolor="#eee" style="padding: 10px 0;">
                    <tr>
                        <td style="font-size:8px; margin-top:5px;" align="center" valign="center" cellpadding="0" class="footerContent" style="padding-bottom:15px;">
                            &copy; 8 Abubakr St, fayrouz District
                            <br />
                            Behind Mall of Arabia 6 th octobar , GizaEGYPT
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top">
                            <table border="0" cellpadding="5" cellspacing="0" id="utilityLink">
                                <tr>
                                    <td valign="top" class="utilityLinkContent">
                                        <a href="..." target="_blank"  style="font-size:8px;">Unsubscribe</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                </center>
              </body>
            </html>`
      };
    
      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          return console.log(error);
        }
        let message = "Un email a été envoyé à l'adresse : "+ req.body.email;
        res.json({msg: message});
      });
      // let message = "Un email a été envoyé à l'adresse :"+ req.body.email + ".";
      // res.json({msg: message});
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/reset');
  });

});

module.exports = router;