var express = require('express');
var mySql = require('mysql');
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json();

var router = express.Router();

var mainDomain = "wingoku.com";
var connection;
var response;
var shortUrl;
var originalUrl;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', shortenedUrl: ''});
    console.log("index.js method 0");
    mySqlDatabase();
});

router.get('/yolo', function(req, res, next) {
    console.log("hello inside index.js method 1: "+ req.body.urlEditText);
});

router.post('/yolo', jsonParser, function(req, res, next) {

    response = res;
    originalUrl = req.body.textBoxValue;
    shortUrl = shortenTheUrl(req.body.textBoxValue);
    //response.json({ title: 'NewTitle', shortenedUrl: shortenedUrl}); uncomment later

    var insertDataInTableQuery = "INSERT INTO `WinGoku`.`ShortenedUrlsTable` (`OriginalUrl`, `ShortUrl`) VALUES('"+req.body.textBoxValue+ "', '"+ shortUrl +"')";
    runSQLQuery(insertDataInTableQuery, handleMysqlDBQueryResponse, sendResponseToClient);
});

function mySqlDatabase() {
    connection = mySql.createPool({
        connectionLimit: 20,
        host: 'localhost',
        port: '3306',
        root: 'root',
        password: '',
        database: 'WinGoku'
    });

    console.log("trying to connect");
    connection.getConnection(function (error) {
        if(error) {
            console.log('Connection Error: ' + error.message);
            return;
        }
        console.log('Connected to MySQL');
    });

    var createDBQuery;
    createDBQuery = "CREATE TABLE `WinGoku`.`ShortenedUrlsTable` (`id` INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY, `OriginalUrl` VARCHAR(256) NOT NULL UNIQUE, `ShortUrl` VARCHAR(256) NOT NULL)";

    runSQLQuery(createDBQuery);
}

function shortenTheUrl(url) {
    console.log("shortenUrl(): "+ url);

    var allCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var shortenedUrl = "/";

    for(var i=0; i<5; i++) {
        shortenedUrl += allCharacters.charAt(Math.random()*allCharacters.length);
    }

    console.log("theShortenedUrlIS: "+ mainDomain.concat(shortenedUrl) + " orignal: "+ url);
    return mainDomain.concat(shortenedUrl);
}

function handleMysqlDBQueryResponse(queryExecutionResult) {
    var mess = queryExecutionResult["errorMessage"];
    if(queryExecutionResult["errorMessage"] !== "successful") {
        mess = "Duplicate Url";

        var query = "SELECT `ShortUrl` FROM `WinGoku`.`ShortenedUrlsTable` WHERE `OriginalUrl` LIKE '"+ originalUrl+"'";
        runSQLQuery(query, sendResponseToClient);
    }

    console.log("adfadsf 1: "+ queryExecutionResult["type"] + " 2: "+ queryExecutionResult["errorMessage"]);
}

function sendResponseToClient(queryExecutionResult, dataReturnedFromQuery) {
    var mess = queryExecutionResult["errorMessage"];

    if(queryExecutionResult["errorMessage"] !== "successful")
        console.log("failed: "+ dataReturnedFromQuery);
    console.log("1: "+ queryExecutionResult["type"] + " 2: "+ queryExecutionResult["errorMessage"] + " data: "+ dataReturnedFromQuery);
    response.json({shortenedUrl: dataReturnedFromQuery, type: queryExecutionResult["type"], message: mess});

}

function runSQLQuery(query, handleDBQueryResponse, sendDataToClientUponDBQuerySuccess) {
    console.log("run sql querys");
    connection.query(query, function(error, row, field) {
        if (error) {
            //console.log(query);
            console.log("QueryError: " + error + " query: " + query);
            if (handleDBQueryResponse != undefined)
                handleDBQueryResponse({type: "alert", errorMessage: error});
            return;
        }
        console.log("query successfull: ");

        if (sendDataToClientUponDBQuerySuccess != undefined) {
            if(row === undefined)
                sendDataToClientUponDBQuerySuccess({type: "alert", errorMessage: "successful"}, shortUrl);
            else
                sendDataToClientUponDBQuerySuccess({type: "alert", errorMessage: "successful"}, row[0].ShortUrl);
        }
    });
}

module.exports = router;
