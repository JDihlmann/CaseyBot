// Express Module 
var express = require('express');
var app = express();

// Other Modules
var slackbot = require('slackbots');
var server = require('http').createServer(app);  
var google = require('googleapis');
var mongoose = require('mongoose');
var request = require('request');
var bodyParser = require('body-parser')
app.use( bodyParser.json() );    
app.use(bodyParser.urlencoded({  
  extended: true
})); 


//Start Application And Socket Listen
var port =  3000;
server.listen(port);
console.log("Server started on " + port);



//MongoDB 
//MAC 4321 // SERVER 27017
mongoose.connect('mongodb://localhost:27017/caseybot');
var db = mongoose.connection;

db.on('error', function (err) {
	console.log('Database Connection Error: ', err);
});

db.once('open', function () {
	//test()
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
	teamID: String,
	teamName: String, 
	botID: String,
	botToken: String,
    globalToken: String
});



// Look for better request with JSON Parser
companySchema.methods.sendToTeam = function (videoURL) {
	var token = this.botToken
	request.post({url:'https://slack.com/api/rtm.start', form: {token: this.botToken}}, function(err, httpResponse, body){
		if(!err) {
			var parsedBody = JSON.parse(body)
			if(parsedBody.ok) {
				var channels = parsedBody.channels
				for( var i = 0; i < channels.length; i++) {
					var channel = channels[i]
					if(channel.is_member && !channel.is_archived ) {
						sendToChannel(channel.id, token , videoURL)
					}
				}
			}
		}

	})

}


var Company = mongoose.model('companies', companySchema);


function test() {
	Company.find({}, function(err, companies) {
		if(!err) {
			for( var i = 0; i < companies.length; i++) {
				companies[0].sendToTeam("https://www.youtube.com/watch?v=Pg727Z7l3xI")
			}
		} 
	});
}


function sendToChannel(channel, token, videoURL) {
	form = {
		token: token,
		channel: channel,
		text: videoURL,
		as_user: true
	}

	request.post({url:'https://slack.com/api/chat.postMessage', form: form }, function(err, httpResponse, body){
		console.log()
	})
} 





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

	saveToDB(currentVideo)
	sendVideoToEveryTeam(currentVideo.getURL())
}

function sendVideoToEveryTeam(videoURL) {
	Company.find({}, function(err, companies) {
		if(!err) {
			for( var i = 0; i < companies.length; i++) {
				companies[0].sendToTeam(videoURL)
			}
		} 
	});
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
var intervallFrequenz = 30000
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

	var code = req.query.code

	var form = {
		code: code,
		client_id: "19474255650.38637281299",
		client_secret: process.env.CLIENT_SECRET,
		redirect_uri: "http://107.170.61.40:3000/oauth"


	}

	request.post({url:'https://slack.com/api/oauth.access', form: form}, function(err, httpResponse, body){

		if(!err) {
			var parsedBody = JSON.parse(body)
			if(parsedBody.ok) {


				Company.find({ 'teamID': parsedBody.team_id}, function(err, companies) {
					if(!err && companies.length == 0) {
						var currentCompany = new Company({ 
							teamID: parsedBody.team_id,
							teamName: parsedBody.team_name, 
							botID: parsedBody.bot.bot_user_id, 
							botToken: parsedBody.bot.bot_access_token,
    						globalToken: parsedBody.access_token
						});

						for(var i = 0; i < 10000; i++) {
							saveToDB(currentCompany)
						}
					} 
				})

				res.send('<html><body><h3> Worked :) </h3></body></html>')
			} else {
				res.send('<html><body><h3> Error:' +  body + '</h3></body></html>')
			}	
		} else {
			res.send('<html><body><h3> Error </h3></body></html>')
		}

	})
});






