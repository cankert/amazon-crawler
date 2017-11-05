var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
    
res.render('index', { title: 'productNamsse' });
});

// Functions

function scrapeSite(url){
    request(url, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var productName = $('#productTitle').text().trim().replace(/\s\s+/g, ',');
    var preis = $('#priceblock_ourprice').text();
    var image = $('#landingImage').data('oldHires');
    var availability = $('#availability span').text().trim().replace(/\s\s+/g, ',');
    console.log(productName);
    console.log(preis);
    console.log(image);
    console.log(availability);

  }
});
}



module.exports = router;
