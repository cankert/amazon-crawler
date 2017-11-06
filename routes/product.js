var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');


/* GET users listing. */
/*router.get('/:id', function(req, res, next) {
    var url = 'https://www.amazon.de/gp/product/' + req.params.id;

    scrapeSite(url, renderPage);

    function renderPage(productName,preis, salepreis,image,availability, strokepreis){
        res.render('product', { productName: productName, preis: preis, salepreis: salepreis, image:image, availability: availability, strokepreis:strokepreis });
    }

});*/

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
            'image': productImage,
            'availability': productAvailability,
            };

        res.json(productJSON);
    }
});

/*
router.post('/', function(req, res, next) {
  res.send('respond with a resource');
});

res.render('index', { title: productName });

router.update('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.delete('/', function(req, res, next) {
  res.send('respond with a resource');
});*/


/*function getAsin(req,callback){
    var url = req.query.url;
    //var url = 'http://www.amazon.de/gp/product/B00GU556SA/';
    //console.log('Trying this ' + url);
    request(url, function (error, response, html) {
        //console.log(request.statusCode);
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            //var productAsin = $('#priceblock_ourprice').text();
            var productAsin = $('#ASIN').val();
            console.log('Found this ASIN: ' + productAsin);
            callback(productAsin, url);
          }
          else {
              console.log('ASIN Scrape Failed - Wrong URL or ID?');
          }

    });
}*/

function scrapeSite(req, callback){
    var url = req.query.url;
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var productName = $('#productTitle').text().trim().replace(/\s\s+/g, ',');
            var productPreis = $('#priceblock_ourprice').text();
            var productStrokepreis = $('span.a-text-strike').text();
            var productSalepreis = $('#priceblock_saleprice').text();
            var productImage = $('#landingImage').data('oldHires');
            var productAsin = $('#ASIN').val();
            var productAvailability = $('#availability span').text().trim().replace(/\s\s+/g, ',');
            console.log('Found Product and calling callback');
            callback(productName,productPreis, productSalepreis,productImage,productAvailability, productStrokepreis, productAsin);
          }
          else {
              console.log('Scrape Failed - Wrong URL or ID?');
          }

    });

}




module.exports = router;
