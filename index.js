// Express Module 
var express = require('express');
var app = express();

// Other Modules
var slackbot = require('slackbots');
var server = require('http').createServer(app);  
var jsonfile = require('jsonfile')
var google = require('googleapis');
var slackbot = require('slackbots');
var MongoClient = require('mongodb').MongoClient
var format = require('util').format;
 


//Start Application And Socket Listen
var port =  3000;
server.listen(port);
console.log("Server started on " + port);

MongoClient.connect('mongodb://localhost/caseybot', function (err, db) {
    if (err) {
        throw err;
    } else {
        console.log("successfully connected to the database");
    }
    db.close();
});


app.get('/', function (req, res) {
  res.send('<html><body><h1>Hello World</h1></body></html>');
});



// // Setup Youtube API
// var api_key = process.env.GOOGLE_KEY;
// var youtube = google.youtube('v3');
// //var currentURL = "getURL"

// //Setup File 
// var file = 'storage/storage.json'




// // Slackbot
// var bot = new slackbot({
//     token: process.env.SLACK_KEY,
//     name: 'casey'
// });



// // Send Youtube Requests
// function youtubeRequest() {
// 	youtube.activities.list({key: api_key, part:'contentDetails', channelId: 'UCtinbF-Q-fVthA0qrFQTgXQ', maxResults: 1}, function(err, res) {
// 			var content = res.items[0].contentDetails
// 			if(content) {
// 				var upload = content.upload
// 				if(upload) {
// 					var video = upload.videoId
// 					var videoURL = 'https://www.youtube.com/watch?v=' + video

// 					// Store Data 
// 					jsonfile.readFile(file, function(err, res) {
// 						if(!err) {
// 							if(res.video != videoURL) {
// 								writeData(videoURL)
// 								bot.postMessageToChannel('general', videoURL, {as_user: true});
// 							}
// 						}
// 					})
// 				}
// 			}
// 	});
// }




// // Write Data to Storage 
// function writeData(videoURL) {
// 	var obj = {video: videoURL}
// 	jsonfile.writeFile(file, obj, function (err) {
// 		if(err) {
// 			console.log(err)
// 		}
// 	})
// }


// // Intervall
// var intervall = setInterval(function() { 
// 	youtubeRequest()
// }, 30000);
