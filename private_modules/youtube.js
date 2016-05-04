/* YOUTUBE MODULE */
'use strict';

// Public Modules 
var google = require('googleapis');
var youtube = google.youtube('v3');

// Variables 
var apiKey
var currentID 
var channelID = 'UCtinbF-Q-fVthA0qrFQTgXQ'

// Intervall Variables
var intervall = 30000
var youtubeRequestInterval
var youtubeRequestCallback


// (F) Set Api Key
function setAPIKey(googleAPIKey) {
	apiKey = googleAPIKey
}

var publicCallback

// (F) Start Request Intervall
function startRequestIntervall(callback) {
	youtubeRequestCallback = callback
	youtubeRequestInterval = setInterval(channelActivities, intervall)
}

// (F) Stop Request Intervall
function stopRequestIntervall() {
	clearInterval(youtubeRequestInterval)
}



// (F) Make Youtube Channel Activities Request
function channelActivities() {
	youtube.activities.list({key: apiKey, part: 'contentDetails', channelId: channelID, maxResults: 1}, function(err, res) {
		if(!err) {
			var upload = res.items[0].contentDetails.upload
			if(upload != undefined) {
				var videoID = res.items[0].contentDetails.upload.videoId
				currentID = videoID
				youtubeRequestCallback(videoID)
			}
		} else {
			// Log Other Class
			console.log("(ERR YOUTUBE): Channel Activities")
			console.log(err)
		}
	});
}

function latestVideo(callback) {
	youtube.activities.list({key: apiKey, part: 'contentDetails', channelId: channelID, maxResults: 1}, function(err, res) {
		if(!err) {
			var upload = res.items[0].contentDetails.upload
			if(upload != undefined) {
				var videoID = res.items[0].contentDetails.upload.videoId
				callback(videoID)
			}
		} else {
			// Log Other Class
			console.log("(ERR YOUTUBE): Latest Video")
			console.log(err)
		}
	});
}


// (F) Make Youtube Video Thumbnail Request
function videoThumbnail(videoID, callback) {
	youtube.videos.list({key: apiKey, part: 'snippet', id: videoID, maxResults: 1}, function(err, res) {
		if(!err) {
			var upload = res.items[0].snippet
			if(upload != undefined) {
				callback(videoID)
			}
		} else {
			// Log Other Class
			console.log("(ERR YOUTUBE): Video Thumbnail")
			console.log(err)
		}
	});
}




module.exports = {
	intervall: intervall,
	currentID: currentID,

	setAPIKey: setAPIKey,
	latestVideo: latestVideo,
	videoThumbnail: videoThumbnail,
	stopRequestIntervall: stopRequestIntervall,
	startRequestIntervall: startRequestIntervall
}