var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
    var url = 'https://www.amazon.de/gp/product/B018LOK06A/ref=s9u_cartx_gw_i1?ie=UTF8&pd_rd_i=B018LOK06A&pd_rd_r=faeb0db0-bd49-11e7-ad04-0b97a8a2142a&pd_rd_w=dDlqZ&pd_rd_wg=BLQGA&pf_rd_m=A3JWKAKR8XB7XF&pf_rd_s=&pf_rd_r=N6F79XPW1CJQ8EDC4HBM&pf_rd_t=36701&pf_rd_p=c210947d-c955-4398-98aa-d1dc27e614f1&pf_rd_i=desktop';
    scrapeSite(url);
    res.render('index', { title: 'Express' });
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
