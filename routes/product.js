var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
const monk = require('monk');
const co = require('co');
const generate = require('node-chartist');

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

    scrapeSite(req,respondJSON);

    function respondJSON(productName,productPreis, productSalepreis,productImage,productAvailability, productStrokepreis, productAsin, url){
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
});

router.get('/chart', function(req, res, next) {
    //var db = req.db;
    //var collection = db.get('productlist');
    generateChart(sendChart);
    function sendChart(data){
        res.send(data);
    }

});

router.get('/detail/:id', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productdata');
    var documentId = req.params.id;
    console.log(documentId);

    collection.find({'productid': documentId},{},function(e,docs){

        generateChart(docs, sendPage);

        function sendPage(docs, chart){
            
            res.render('productdetail', { title: 'Productdetail' , productdata: docs, chart:chart});
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

router.put('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('productlist');
    var documentId = monk.id(req.body.id);
    console.log('THIS IS REALPREIS' + realpreis);
    var realpreis = req.body.realpreis;
    collection.update({ _id: documentId},{$set:{realpreis: realpreis}}, function(err, result){
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


function scrapeSite(req, callback){
    var url = req.query.url;
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
            console.log('Found Product and calling callback');
            callback(productName,productPreis, productSalepreis,productImage,productAvailability, productStrokepreis, productAsin, url);
          }
          else {
              console.log('Scrape Failed - Wrong URL or ID?');
          }

    });

}

// HTML Chart Generation

function generateChart(docs, callback){

    co(function * () {

      // options object
      const options = {width: 400, height: 200};
      const data = {
        labels: ['a','b','c','d','e'],
        series: [
          [1, 2, 3, 4, 5],
          [3, 4, 5, 6, 7]
        ]
      };
      const bar = yield generate('line', options, data);
      //console.log(bar);
      callback(docs, bar);
    });

}




module.exports = router;
