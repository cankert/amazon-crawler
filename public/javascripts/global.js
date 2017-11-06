$(document).ready(function(){

    $('#submiturl').on('click', addPage);
    getProductList();
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
            console.log(data);
            // Stick our user data array into a websiteList variable in the global object
            var productData = data;

            // For each item in our JSON add a table row and cells to the content string
            $.each(productData, function(){
                id=this._id;
                
                updateEntry(id);

            });
            drawTable(tableContent);

        });



}

function updateEntry(id){
    console.log(id);
}



function crawlpage(){
var url = $('#urltosubmit').val();
$.ajax({
    type: 'GET',
    url: ('/product'),
    data: {
        'url': url
        },
    }).done(function(response){
        //var object = JSON.parse(response);
        var realpreis = ""

        if (response.preis == ""){
            realpreis = response.salepreis+ ' anstatt <strike>' + response.strokepreis+ '</strike>';
        } else {
            realpreis = response.preis;
        }
        var tableContent = '<tr><td>'+response.asin+'</td><td>'+response.name+'</td><td>'+realpreis+'</td><td>'+response.availability+'</td><td><img width="100px" src="'+response.image+'"</td></tr>';
        drawTable(tableContent);

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
