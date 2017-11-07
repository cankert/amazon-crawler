$(document).ready(function(){

    $('#submiturl').on('click', addPage);
    $('#updateall').on('click',updateProducts);
    refreshTable();
    setInterval(function(){
        refreshTable();
    }, 5000);
    //getChart();
});

function getChart(){
    $.ajax({
        type: 'GET',
        url: ('/product/chart'),
        data: "",
        }).done(function(response){
            $('#chart').html(response);
        });

}

function addPage(){
    var url = $('#urltosubmit').val();
    getProductName(url, postProduct)
    setTimeout(function(){
        refreshTable();
        updateProducts();
    }, 4000);
}

function postProduct(data){
    $.ajax({
        type: 'POST',
        url: ('/product'),
        data: data,
        }).done(function(response){
            //var object = JSON.parse(response);
            console.log('Product added');;
        });
}

function getProductName(url, callback){
    $.ajax({
        type: 'GET',
        url: ('/product'),
        data: {
            'url': url
            },
        }).done(function(response){
            callback(response);
        });
}

function refreshTable(){
    $.getJSON( '/product/productlist/',function( data ) {
        var tableContent = '';
        //console.log(data);
        // Stick our user data array into a websiteList variable in the global object
        var productData = data;

        // For each item in our JSON add a table row and cells to the content string
        $.each(productData, function(){

            tableContent += '<tr>';
            tableContent += '<td>'+this.asin + '</td>';
            tableContent += '<td width="300px"><a href="/product/detail/'+this._id+'">'+this.name + '</a></td>';
            tableContent += '<td><img src="'+this.image+'" width="150px"></img></td>';
            tableContent += '<td style="max-width:200px; overflow:hidden;">'+this.realpreis+' €</td>';
            tableContent += '</tr>';

        });

        drawTable(tableContent);

    });
}

function updateProducts(){
    $.getJSON( '/product/productlist/',function( data ) {

        //console.log(data);
        // Stick our user data array into a websiteList variable in the global object
        var productData = data;

        // For each item in our JSON add a table row and cells to the content string
        $.each(productData, function(){
            //console.log(id);
            var url = this.url;
            console.log(url);
            var id = this._id;
            crawlpage(url, id, postProductData);
        });

        setTimeout(function(){
            refreshTable();
        }, 4000);

    });
}



function crawlpage(url, id, callback){

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
            var currentDate = new Date ();
            var dd = currentDate.getDate();
            var mm = currentDate.getMonth()+1;
            var yyyy = currentDate.getFullYear();
            var today = dd + '.' + mm + '.' + yyyy;

            var hh = currentDate.getHours();
            var min = currentDate.getMinutes();
            var time = hh + ':' + min;

            var productObject = {
                'productid': id,
                'date':today,
                'time': time,
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
            //console.log(realpreis);
            updatePreis(id, realpreis);
            callback(productObject);

        });
}

function updatePreis(id, realpreis){
    $.ajax({
        type: 'PUT',
        url: ('/product/'),
        data: {
            'id': id,
            'realpreis': realpreis,
        },
        }).done(function(response){
            //var object = JSON.parse(response);
            console.log('Updated Preis');
        });
}


function postProductData(productObject){
    $.ajax({
        type: 'POST',
        url: ('/product/productdata'),
        data: productObject,
        }).done(function(response){
            //var object = JSON.parse(response);
            console.log('Posted Update');
        });
}

function drawTable(tableContent){

    $('#producttable tbody').html(tableContent);
}
