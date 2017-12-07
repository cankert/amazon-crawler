var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
const monk = require('monk');
const co = require('co');
const generate = require('node-chartist');
const nodemailer = require('nodemailer');
const notifier = require('node-notifier');


/* GET users listing. */
/*router.get('/:id', function(req, res, next) {
    var url = 'https://www.amazon.de/gp/product/' + req.params.id;

    scrapeSite(url, renderPage);

    function renderPage(productName,preis, salepreis,image,availability, strokepreis){
        res.render('product', { productName: productName, preis: preis, salepreis: salepreis, image:image, availability: availability, strokepreis:strokepreis });
    }

});

collection.find({'websiteid': monk.id(documentId)}, {sort: {date:-1}}).then((website) => {
    //console.log(website);
    res.render('website', { title: name , statusdata: website});


*/

router.get('/', function(req, res, next) {
    var url = req.query.url;
    var id = req.query.id;
    var watchprice = req.query.watchprice;
    scrapeSite(req, url,id,watchprice, respondJSON);

    function respondJSON(req, id, productName,productPreis, productSalepreis,productImage,productAvailability, productStrokepreis, productAsin, url){
        var productJSON = {
            'url': url,
            'name': productName,
            'asin': productAsin,
            'preis': productPreis,
            'salepreis': productSalepreis,
            'strokepreis': productStrokepreis,
            'realpreis':"",
            'image': productImage,
            'availability': productAvailability,
            'watchprice':'0'
            };

        res.json(productJSON);
    }
});

router.get('/productlist', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
    //sendMail('Betreff','Nachricht');
});

router.get('/chart', function(req, res, next) {
    //var db = req.db;
    //var collection = db.get('productlist');
    generateChart(sendChart);
    function sendChart(data){
        res.send(data);
    }

});

router.get('/update', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');

    collection.find({},{},function(e,docs){
        docs.forEach(function(item){
            var url = item.url;
            var id = item._id;
            var watchprice = item.watchprice;
            //console.log('THIS IS UPDATE ID '+id);
            //console.log('THIS IS NOMONK ID '+nomonk);
            scrapeSite(req, url, id, watchprice, postProductData);
            //scrapeSite(url);
        });
    })

    //console.log(data);

    function logg(productObject){
        console.log('Update Check!!!');
        postProductData2(productObject);
    }

    res.send('');
});

router.get('/detail/:id/:title?', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productdata');
    var documentId = monk.id(req.params.id);
    var title = req.params.title;
    console.log(documentId);

    collection.find({'productid': documentId},{},function(e,docs){

        generateChart(docs, sendPage);

        function sendPage(docs, chart){

            res.render('productdetail', { title: title , productdata: docs.reverse(), chart:chart});
        }


    });

});




router.post('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? {msg: '' } : {msg: err }
        );
    });
});

router.delete('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');
    var documentId = monk.id(req.body.id);
    collection.remove({ _id: documentId}, function(err, result){
        res.send(
            (err === null) ? {msg: '' } : {msg: err }
        );
    });
});

router.put('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');
    var documentId = monk.id(req.body.id);
    var realpreis = req.body.realpreis;
    collection.update({ _id: documentId},{$set:{realpreis: realpreis}}, function(err, result){
        res.send(
            (err === null) ? {msg: '' } : {msg: err }
        );
    });

});

router.put('/watchprice', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');
    var documentId = monk.id(req.body.id);
    var watchprice = req.body.watchprice;
    collection.update({ _id: documentId},{$set:{watchprice: watchprice}}, function(err, result){
        res.send(
            (err === null) ? {msg: '' } : {msg: err }
        );
    });

});

router.post('/productdata', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productdata');
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? {msg: '' } : {msg: err }
        );
    });
});

////////////////////////FUNCTIONS////////////////////////////////////////////////////////

function updateRealpreis(req, id, realpreis){
    var db = req.db;
    var collection = db.get('productlist');
    var documentId = monk.id(id);
    collection.update({ _id: documentId},{$set:{realpreis: realpreis}}, function(err, result){
        console.log('Realpreis Updated');
    });
}



function postProductData(req, id, productName,productPreis, productSalepreis,productImage,productAvailability, productStrokepreis, productAsin, url){
    var db = req.db;
    var collection2 = db.get('productdata');

    if (productPreis==""){
        var realpreis=productSalepreis;
    }else{
        var realpreis=productPreis;
    }
    var currentDate = new Date ();
    var dd = currentDate.getDate();
    var mm = currentDate.getMonth()+1;
    var yyyy = currentDate.getFullYear();
    var today = dd + '.' + mm + '.' + yyyy;
    var utc = currentDate.getTime();
    var hh = currentDate.getHours();
    var min = currentDate.getMinutes();
    var time = hh + ':' + min;
    var linuxtime = Date.now();

    var productObject = {
        'productid': monk.id(id),
        'utc':utc,
        'date':currentDate,
        'time': time,
        'name': productName,
        'url': url,
        'asin': productAsin,
        'preis': productPreis,
        'salepreis': productSalepreis,
        'strokepreis': productStrokepreis,
        'realpreis':realpreis,
        'image': productImage,
        'availability': productAvailability,
    };

    collection2.insert(productObject, function(err, result){
        console.log('UpdateSuccess');
        //console.log(result);
    });

    updateRealpreis(req, id,realpreis);
}




function scrapeSite(req,url,id, watchprice,callback){
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var productName = $('#productTitle').text().trim().replace(/\s\s+/g, ',');
            var productPreis = $('#priceblock_ourprice').text().replace('EUR ','');
            var productStrokepreis = $('span.a-text-strike').text().replace('EUR ','');
            var productSalepreis = $('#priceblock_saleprice').text().replace('EUR ','');
            var productImage = $('#landingImage').data('oldHires');
            var productAsin = $('#ASIN').val();
            var productAvailability = $('#availability span').text().trim().replace(/\s\s+/g, ',');
            //console.log('Found Product and calling callback' + id);
            callback(req, id, productName,productPreis, productSalepreis,productImage,productAvailability, productStrokepreis, productAsin, url);

            if (productPreis==""){
                var realpreis=productSalepreis;
            }else{
                var realpreis=productPreis;
            }

            if(parseFloat(realpreis)<parseFloat(watchprice)){
                nachricht = (
                "Hier der Link: " + url
                );
                sendMail(productName + ' ist im Angebot für '+realpreis, nachricht)
                notifier.notify({
                    'title': 'Amazon Crawler',
                    'message': productName + ' ist im Angebot für '+realpreis+' Watchprice war: '+watchprice
                });

                notifier.notify({
                    'title': 'Amazon Crawler',
                    'message': 'Found Product '+productName + ' for: '+realpreis
                });

                console.log('Found Product '+productName + ' for: '+realpreis);
            }

          }
          else {
              console.log('Scrape Failed - Wrong URL or ID?');
          }

    });

}

// HTML Chart Generation

function generateChart(docs, callback){

    // aus docs tabellen Daten machen
    //console.log(docs);
    var labelData = [];
    var seriesData = [];
    var docsSorted = docs.sort(function(a, b) {
    return parseFloat(b.utc) - parseFloat(a.utc);
    });
    var docsSliced = docsSorted.reverse().slice(Math.max(docsSorted.length - 1000, 0));

    docsSliced.forEach(function(item){
        var preis = parseFloat(item.realpreis);
        var datum = item.date;
        seriesData.push(preis);
        labelData.push(datum);
    });
    //console.log(docsSliced);

    co(function * () {

      // options object
       const options = (Chartist) => ({width: 1000, height: 200, fullWidth: true, axisY: { type: Chartist.AutoScaleAxis },
           showPoint:false,
           axisX: {
               //type: Chartist.AutoScaleAxis,
               divisor:2,
               showLabel: false,


               //divisor: 400
            }
       });
      /*const options = {
          width: 1000, height: 200, fullWidth: true,
          axisX: {
              type: generate.FixedScaldeAsxis,
              high:10,
              ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
              scaleMinSpace: 20,
              divisor: 4,
              //labelInterpolationFnc: function(value) {
              //return moment(value).format('MMM D');
            //}
          }
      };*/

      const data = {
        labels: labelData,
        series: [seriesData]
      };
      const bar = yield generate('line',options, data);
      //console.log(bar);
      callback(docs, bar);
    });

}
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
