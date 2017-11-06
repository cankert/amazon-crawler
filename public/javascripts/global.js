$(document).ready(function(){

    $('#submiturl').on('click', crawlpage);

});



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


function drawTable(tableContent){

    $('#producttable tbody').html(tableContent);
}
