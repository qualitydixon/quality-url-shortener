var express = require('express');
var mongo = require('mongodb');

var app = express();


mongo.MongoClient.connect('mongodb://dbuser:dbuser@ds021989.mlab.com:21989/url-shortener' || 'mongodb://localhost:27017/url-shortener', function(err, db) {
    
    if (err) {
        throw new Error('Database failed to connect!');
    } else {
        console.log('Successfully connected to MongoDB on port 27017.');
    }
  
    app.set('port', (process.env.PORT || 5000));

    app.use(express.static(__dirname + '/public'));

    app.get('/', function(request, response) {
        console.log("Home Page!");
        response.render('pages/index');
    });
    
    db.createCollection("sites", {
        capped: true,
        size: 5242880,
        max: 5000
    });
    
    app.get('/new/:url*', function(req, res) {
       // req.url returns /new/<new url>. Hence the slice(5)
       var url = req.url.slice(5);
       var base_url = "https://quality-url-shortener.herokuapp.com/";
       var short_url = makeUrl();
       res.send(JSON.stringify({"original_url" : url, "short_url": base_url + short_url})); 
       saveDocument({"original_url" : url, "short_url": short_url}, db);
    });
    
    app.get('/:url', function(req, res) {
       var url = req.params.url;
       var base_url = "https://quality-url-shortener.herokuapp.com/";
       lookupURL(url, db, res)
    });
    
    function saveDocument(obj, db) {
        
        var sites = db.collection('sites');
        sites.save(obj, function(err, result) {
        if (err) throw err;
        console.log('Saved ' + result);
        });
  }
    
    function makeUrl() {
        var str = "";
        var poss = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            str += poss.charAt(Math.floor(Math.random() * poss.length));

        return str;
    }
    
    function lookupURL(link, db, res) {
        
        var sites = db.collection('sites');
        // returns first document in the collection that matches the query criteria
        sites.findOne({
        "short_url": link
        }, function(err, result) {
        if (err) throw err;
        console.log('Message');
        if (result) {
            console.log(Object.keys(result));
            console.log(result.short_url);
            console.log('Redirecting to: ' + result.original_url);
            res.redirect(result.original_url);
        } else {
            // we don't
            res.send('Site not found!');
        }
    });
    }

    app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
    });
    
});
