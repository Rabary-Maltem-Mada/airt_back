var router = require('express').Router();
var mongoose = require('mongoose');
const async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var User = mongoose.model('User');
const url = require('url');

router.post('/:token', function(req, res, next) {
    async.waterfall([
        function(done) {
          User.findOne({ resetPasswordToken: req.body.data.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
              return res.status(200).json({errors: {token: "Password reset token is invalid or has expired."}});
            }
            console.log('user', user)
            user.setPassword(req.body.data.newpass);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
    
            user.save().then(function(){
                res.json({user: user.toAuthJSON()});
              });
          });
          var transporter = nodemailer.createTransport('smtps://rbrstart%40gmail.com:start0001@smtp.gmail.com');
          // var data = req.body;
          // console.log('Email sent by', data.body.contactName);
          var mailOptions = {
            to: 'rabary@passion4humanity.com',
            from: 'passwordreset@tiketi.com',
            subject: 'Félicitation!',
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
                              <h2>Felicitation!</h2>
                              <p>Votre demande de changement de mot de passe s'est éfféctué avec succès</p>
    
                              <p>Cliquez sur le lien pour acceder à la page de connexion</p>
                              <br>
                              <a  href="http://localhost:4200" style="font-size:15px;color:#0c8b42;background-color: #ffffff; text-decoration:underline;padding:10px;" target="_blank">
                              accéder à la page de connexion</a>
                              <br>
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
            console.log('Message sent: ' + info.response);
            console.log('Data:' + 'rabary');
          });
          res.json({response: {succès: "succès"}});
        },
        

        ], function(err) {
          if (err) return next(err);
          res.redirect('/');
        });
  });
  
  module.exports = router;
  
