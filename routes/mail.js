var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const monk = require('monk');


/* GET home page. */
router.post('/', function(req, res, next) {

var betreff = req.body.betreff;
var nachricht = req.body.nachricht;

sendMail(betreff, nachricht);

res.send('');
});


///////////////////////////////////////////////////////////////////////////

function sendMail(betreff,nachricht){


        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: 'w010a028.kasserver.com',
            port: 25,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'm02a5104', // generated ethereal user
                pass: 'freemail'  // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Christian Ankert" <mail@ankertc.de>', // sender address
            to: 'ankert.c@gmail.com', // list of receivers
            subject: betreff, // Subject line
            text: nachricht, // plain text body
            html: nachricht // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);

        });
}


module.exports = router;
