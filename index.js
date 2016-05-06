// Express Module 
var express = require('express');
var app = express();

// Public Modules
var server = require('http').createServer(app); 

// Private Modules 
var log = require('./private_modules/log');
var slack = require('./private_modules/slack');
var youtube = require('./private_modules/youtube');
var facebook = require('./private_modules/facebook');
var mongoose = require('./private_modules/mongoose');



/* SERVER */
var port = 1040
server.listen(port);
log.out("Server started on " + port);



/* MONGOOSE */
// (F) Init Mongoose
mongoose.init(function() {
	initSlack()
	initFacebook()
	youtubeStartRequestIntervall()
	log.out("Database connected")
})



/* SOCIAL NETWORKS */
// (F) Init Slack 
function initSlack() {
	slack.spawnAllBots()
}

// (F) Init Facebook 
function initFacebook() {
	//facebook.spawnBot()
	//facebook.spawnAllUsers()
}



/* YOUTUBE */
// (M) Youtube Module Parameter
youtube.setAPIKey(process.env.GOOGLE_KEY);

// (F) Youtube start request intervall
function youtubeStartRequestIntervall() {
	youtube.startRequestIntervall(youtubeVideoCheck)
}

// (F) Youtube video postet
function youtubeVideoCheck(videoID) {
	mongoose.Video.find({ 'id': videoID }, function(err, videos) {
		if(!err && videos.length == 0) {
			youtube.videoThumbnail(videoID, youtubeVideoUploaded)
		}
	});
}

// (F) Youtube video uploaded
function youtubeVideoUploaded(videoID) {
	var currentVideo = new mongoose.Video({ id: videoID });
	mongoose.saveModel(currentVideo)
	slack.sendMessageToAllTeams(currentVideo.getURL())
	//facebook.sendMessageToAllTeams(currentVideo.getURL())
}



/* OAUTH */
app.get('/oauth', function (req, res) {
	slack.oauthHandler(req, function(message) {
		res.send('<html><body><h3>' + message + '</h3></body></html>')
	}) 
});



// /* WEBSITE ---> MOVE */
app.get('/', function (req, res) {
	var testString = '<a href="https://slack.com/oauth/authorize?scope=bot&client_id=19474255650.38637281299"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>'
	res.send('<html><body><h3>' + testString + '</body></html>');
});