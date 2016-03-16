// Require Modules
var express = require('express')
var jsonfile = require('jsonfile')
var google = require('googleapis');
var slackbot = require('slackbots');

// Start Express
var app = express();
// Host Server
app.set('port', (process.env.PORT || 5000));
app.get('/', function(request, response) {
 	response.send('Hello World!')
})

app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});


// Setup Client API Key
var api_key = process.env.GOOGLE_KEY;

// Setup Youtube API
var youtube = google.youtube('v3');

//Setup File 
var file = 'storage/storage.json'




// Slackbot
var bot = new slackbot({
    token: process.env.SLACK_KEY,
    name: 'casey'
});



// Send Youtube Requests
function youtubeRequest() {
	youtube.activities.list({key: api_key, part:'contentDetails', channelId: 'UCtinbF-Q-fVthA0qrFQTgXQ', maxResults: 1}, function(err, res) {
		if(!err) {
			var content = res.items[0].contentDetails
			if(content) {
				var upload = content.upload
				if(upload) {
					var video = upload.videoId
					var videoURL = 'https://www.youtube.com/watch?v=' + video

					// Store Data 
					jsonfile.readFile(file, function(err, res) {
						if(!err) {
							if(res.video != videoURL) {
								writeData(videoURL)
								bot.postMessageToChannel('raspberrypitesti', videoURL, {as_user: true});
							}
						}
					})
				}
			}
		} else {
			console.log(err)
		}
	});
}

// Write Data to Storage 
function writeData(videoURL) {
	var obj = {video: videoURL}
	jsonfile.writeFile(file, obj, function (err) {
		if(err) {
			console.log(err)
		}
	})
}


// Intervall
var intervall = setInterval(function() { 
	youtubeRequest()
}, 3000);