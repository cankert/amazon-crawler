$(document).ready(function(){

    $('#submiturl').on('click', addPage);
    $('#updateall').on('click',updateProducts);
});



function addPage(){
    var url = $('#urltosubmit').val();
    $.ajax({
        type: 'POST',
        url: ('/product'),
        data: {
            'url': url
            },
        }).done(function(response){
            //var object = JSON.parse(response);
            alert('Product posted');
        });
}

function getProductList(){
    /*$.ajax({
        type: 'GET',
        url: ('/product/productlist/'),
        data: "",
        }).done(function(response){
            console.log(response);
            alert('Getting Product List');
        });*/

        $.getJSON( '/product/productlist/',function( data ) {
            var tableContent = '';
            //console.log(data);
            // Stick our user data array into a websiteList variable in the global object
            var productData = data;

            // For each item in our JSON add a table row and cells to the content string
            $.each(productData, function(){
                id=this._id;

                //updateEntry(id);

            });
            drawTable(tableContent);

        });



}

function updateProducts(){
    $.getJSON( '/product/productlist/',function( data ) {
        var tableContent = '';
        //console.log(data);
        // Stick our user data array into a websiteList variable in the global object
        var productData = data;

        // For each item in our JSON add a table row and cells to the content string
        $.each(productData, function(){
            //console.log(id);
            var url = this.url;
            var id = this._id;
            crawlpage(url, id);
        });
        drawTable(tableContent);

    });
}



function crawlpage(url, id){
$.ajax({
    type: 'GET',
    url: ('/product'),
    data: {
        'url': url
        },
    }).done(function(response){
        //console.log(response.name);
        //console.log(id);
        var productName = response.name;
        if (response.preis==""){
            var realpreis=response.salepreis;
        }else{
            var realpreis=response.preis;
        }
        var productObject = {
            'productid': id,
            'name': response.name,
            'url': url,
            'asin': response.asin,
            'preis': response.preis,
            'salepreis': response.salepreis,
            'strokepreis': response.strokepreis,
            'realpreis':realpreis,
            'image': response.image,
            'availability': response.availability,
        };
        $.ajax({
            type: 'POST',
            url: ('/product/productdata'),
            data: productObject,
            }).done(function(response){
                //var object = JSON.parse(response);
                console.log('Posted Update for: ' + productName);
            });
    });
}
/*
tableContent += '<tr>';
tableContent += '<td>'+this.productAsin + '</td>';
tableContent += '<td>'+this.productName + '</td>';
tableContent += '<td>'+this.productPreis + '</td>';
tableContent += '<td>'+this.productAvailability + '</td>';
tableContent += '<td>'+this.productImage + '</td>';
tableContent += '</tr>';
*/
function drawTable(tableContent){

    $('#producttable tbody').html(tableContent);
}
