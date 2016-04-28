// Express Module 
var express = require('express');
var app = express();

// Other Modules
var slackbot = require('slackbots');
var server = require('http').createServer(app);  
var google = require('googleapis');
var slackbot = require('slackbots');
var mongoose = require('mongoose');
var request = require('request');


//Start Application And Socket Listen
var port =  3000;
server.listen(port);
console.log("Server started on " + port);



//MongoDB 
mongoose.connect('mongodb://localhost:27017/caseybot');
var db = mongoose.connection;

db.on('error', function (err) {
	console.log('Database Connection Error: ', err);
});

db.once('open', function () {
	console.log('Database connected');
});


//MongoDB Schema Video
var video = db.collection('video');
var videoSchema = mongoose.Schema({
    id: String
});

videoSchema.methods.getURL = function () {
	return 'https://www.youtube.com/watch?v=' + this.id
}

var Video = mongoose.model('videos', videoSchema);


//MongoDB Schema Companies
var companies = db.collection('companies');
var companySchema = mongoose.Schema({
    token: String,
    teamID: String,
    teamName: String
});

companySchema.methods.sendToTeam = function (videoURL) {
	var bot = new SlackBot({
    	token: this.token,
    	name: 'Casey'
	});
}

var Company = mongoose.model('companies', companySchema);



// Setup Youtube API
var part = 'contentDetails'
var api_key = process.env.GOOGLE_KEY;
var channelID = 'UCtinbF-Q-fVthA0qrFQTgXQ'
var youtube = google.youtube('v3');




// Send Youtube Requests
function videoYoutubeRequest() {
	youtube.activities.list({key: api_key, part: part, channelId: channelID, maxResults: 1}, function(err, res) {
		if(!err) {
			var videoID  = res.items[0].contentDetails.upload.videoId
			Video.find({ 'id': videoID }, function(err, videos) {
				if(!err && videos.length == 0) {
					videoUploaded(videoID)
					console.log("New Video added with ID: " + videoID)
				}
  			});
		}
	});
}

function videoUploaded(videoID) {

	//Mongo DB Object
	var currentVideo = new Video({ id: videoID });

	saveVideoToDB(currentVideo)
	sendVideoToEveryTeam(currentVideo.getURL())
}

function sendVideoToEveryTeam(videoURL) {


}


function saveToDB(obj) {
	obj.save(function (err) {
  		if (err) return handleError(err);
	})
}


function handleError(err) {
	console.log(err)
}




// Intervall
var intervallFrequenz = 3000
var intervall = setInterval(function() { 
	videoYoutubeRequest()
}, intervallFrequenz);



//Website
app.get('/', function (req, res) {
	var testString = '<a href="https://slack.com/oauth/authorize?scope=bot&client_id=19474255650.38637281299"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>'
	Company.find({}, function(err, companies) {
		if(!err) {
			res.send('<html><body><h3> Subscribed User:' + companies.count + '</h3>' + testString + '</body></html>');
		} else {
			res.send('<html><body><h3> Error </h3>' + testString + '</body></html>');
		}
  	});
});

//Website
app.get('/oauth', function (req, res) {

	console.log(res)

	// var form = {

	// }
	// request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ 

	// })
});
