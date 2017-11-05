var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');


/* GET users listing. */
router.get('/:id', function(req, res, next) {
    var url = 'https://www.amazon.de/gp/product/' + req.params.id;


    scrapeSite(url, renderPage);

    function renderPage(productName,preis, salepreis,image,availability){
        res.render('product', { productName: productName, preis: preis, salepreis: salepreis, image:image, availability: availability });
    }

});



/*router.post('/', function(req, res, next) {
  res.send('respond with a resource');
});

res.render('index', { title: productName });

router.update('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.delete('/', function(req, res, next) {
  res.send('respond with a resource');
});*/



function scrapeSite(url, callback){
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var productName = $('#productTitle').text().trim().replace(/\s\s+/g, ',');
            var preis = $('#priceblock_ourprice').text();
            var salepreis = $('#priceblock_saleprice').text();
            var image = $('#landingImage').data('oldHires');
            var availability = $('#availability span').text().trim().replace(/\s\s+/g, ',');
            console.log('Name: ' + productName);
            console.log('Regulärer Preis: ' + preis);
            console.log('Sale Preis: ' + salepreis);
            console.log('Bild: ' + image);
            console.log('Verfügbarkeit: ' + availability);
            callback(productName,preis, salepreis,image,availability);
          }
          else {
              console.log('Scrape Failed - Wrong URL or ID?');
          }

    });

}




module.exports = router;
