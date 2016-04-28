// Express Module 
var express = require('express');
var app = express();

// Other Modules
var slackbot = require('slackbots');
var server = require('http').createServer(app);  
var google = require('googleapis');
var slackbot = require('slackbots');
var mongoose = require('mongoose');


//Start Application And Socket Listen
var port =  3000;
server.listen(port);
console.log("Server started on " + port);




//Website
app.get('/', function (req, res) {
 	res.send('<html><body><h1>Hello World</h1></body></html>');
});



//MongoDB 
mongoose.connect('mongodb://localhost/caseybot');

var db = mongoose.connection;
// var video = db.collection('video');
// var companies = db.collection('companies');

db.on('error', function (err) {
	console.log('connection error', err);
});

db.once('open', function () {
	console.log('connected.');
});


// //MongoDB Schema
// var videoSchema = mongoose.Schema({
//     id: String
// });

// videoSchema.methods.getURL = function () {
// 	return 'https://www.youtube.com/watch?v=' + this.id
// }

// var Video = mongoose.model('Video', videoSchema);





// Setup Youtube API
var api_key = process.env.GOOGLE_KEY;
var youtube = google.youtube('v3');


// // Slackbot
// var bot = new slackbot({
//     token: process.env.SLACK_KEY,
//     name: 'casey'
// });




// Send Youtube Requests
function youtubeRequest() {
	youtube.activities.list({key: api_key, part:'contentDetails', channelId: 'UCtinbF-Q-fVthA0qrFQTgXQ', maxResults: 1}, function(err, res) {
			// var videoURL = res.items[0].contentDetails.upload.videoId
			// console.log(videoURL)

			if(!err) {
				var videoID  = res.items[0].contentDetails.upload.videoId

				//var currentVideo = new Video({ id: videoID });
				//console.log(currentVideo.getURL()); 

				// currentVideo.save(function (err, video) {
  		// 			if (err) {
  		// 				return console.error(err)
  		// 			} else {
  		// 				return console.error(worked)
  		// 			}
				// });



				//console.log(videoID)
			}





			// if(content) {
			// 	var upload = content.upload
			// 	if(upload) {
			// 		var video = upload.videoId
			// 		var videoURL = 'https://www.youtube.com/watch?v=' + video


			// 		console.log(videoURL)
			// 		//if(res.video != videoURL) {
			// 		//bot.postMessageToChannel('general', videoURL, {as_user: true});



			// 		// Store Data 
			// 		jsonfile.readFile(file, function(err, res) {
			// 			if(!err) {
			// 				if(res.video != videoURL) {
			// 					writeData(videoURL)
			// 					bot.postMessageToChannel('general', videoURL, {as_user: true});
			// 				}
			// 			}
			// 		})
			// 	}
			// }
	});
}





// Intervall
var intervallFrequenz = 3000
var intervall = setInterval(function() { 
	youtubeRequest()
}, intervallFrequenz);
