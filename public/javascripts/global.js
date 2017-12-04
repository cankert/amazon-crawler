$(document).ready(function(){

    $('#submiturl').on('click', addPage);
    $('#updateall').on('click',updateProducts);
    $('#watchpriceSend').on('click',updateWatchprice);
    refreshTable();

    setInterval(function(){
        updateProducts(function(){
            console.log("Running global Update on: ".time.now());
            refreshTable();
        });

    }, 300000);
    //getChart();
});

$(document).on('click','#watchpriceSend',function(e){
    var productId =  $(this).attr('rel');
    var watchpriceValue= ("#watchprice"+productId);
    var watchprice = $(watchpriceValue).val();
    //alert(watchprice);
    setWatchprice(productId, watchprice, refreshTable);
});


$(document).on('click','#deleteItem',function(e){
    var productId =  $(this).attr('rel');
    deleteProduct(productId, refreshTable);
});


function deleteProduct (id, callback){
    $.ajax({
        type: 'DELETE',
        url: ('/product'),
        data: {
            'id':id
        },
        }).done(function(response){
            //var object = JSON.parse(response);
            console.log('Deleted Product');
            callback();
        });
}


function setWatchprice(id, watchprice, callback){
    $.ajax({
        type: 'PUT',
        url: ('/product/watchprice'),
        data: {
            'id':id,
            'watchprice': watchprice,
        },
        }).done(function(response){
            //var object = JSON.parse(response);
            console.log('Updated Watchpreis');
            callback();
        });
}

function updateWatchprice(id, watchprice){
    $.ajax({
        type: 'PUT',
        url: ('/product/watchprice'),
        data: "",
        }).done(function(response){
            $('#chart').html(response);
        });
}


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

}

function postProduct(data){
    $.ajax({
        type: 'POST',
        url: ('/product'),
        data: data,
        }).done(function(response){
            //var object = JSON.parse(response);
            console.log('Product added');
            updateProducts();
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
            tableContent += '<td width="300px"><a href="/product/detail/'+this._id+'/'+this.name+'">'+this.name + '</a></td>';
            tableContent += '<td><img src="'+this.image+'" width="150px"></img></td>';
            tableContent += '<td style="max-width:200px; overflow:hidden;">'+this.realpreis+' €</td>';
            tableContent += '<td ><input type="text" id="watchprice'+this._id+'" placeholder="'+this.watchprice+'"></input></td>';
            tableContent += '<td style="max-width:200px; overflow:hidden;"><input type="submit" rel="'+this._id+'" id="watchpriceSend" value="Watch"></input></td>';
            tableContent += '<td style="max-width:200px; overflow:hidden;"><input type="submit" rel="'+this._id+'" id="deleteItem" value="Löschen"></input></td>';
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
        $.each(productData, function(refreshTable){
            //console.log(id);
            var url = this.url;
            //console.log(url);
            var id = this._id;
            var watchprice = this.watchprice;
            crawlpage(url, id, watchprice, postProductData);
        });




    });
    refreshTable();
}



function crawlpage(url, id,watchprice, callback){

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
            var utc = currentDate.getTime();
            var hh = currentDate.getHours();
            var min = currentDate.getMinutes();
            var time = hh + ':' + min;
            var linuxtime = Date.now();

            var productObject = {
                'productid': id,
                'utc':utc,
                'date':currentDate,
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
            console.log('UPDATING '+watchprice);
            if (realpreis<watchprice){
                console.log('Sending Email with Special Offer');
                sendMail(response.name + ' ist im Angebot für '+realpreis, 'Send from Amazon Crawler')
            }
            //console.log(realpreis);
            updatePreis(id, realpreis);
            callback(productObject);

        });
}




function sendMail(betreff, nachricht){
    console.log('Click');
    $.ajax({
        type: 'POST',
        url: ('/mail'),
        data: {
            'betreff': betreff,
            'nachricht': nachricht
            },
        }).done(function(response){
            console.log('Tried sending Email');
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
