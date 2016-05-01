// Express Module 
var express = require('express');
var app = express();

// Other Modules
var botkit = require('botkit');
var request = require('request');
var google = require('googleapis');
var mongoose = require('mongoose');
var slackbot = require('slackbots');
var server = require('http').createServer(app);  





/* SERVER */
var port = 3000
server.listen(port);
console.log("Server started on " + port);





/* LOG HANDLER */
// (V) Log in Slack
var logTarget= process.env.LOG_TARGET

// (F) Handle log messages
function log(message) {
	switch(logTarget) {
	    case 'dev':
	        console.log(message)
	        break;
	    case 'slack':
	    	console.log("Send To Slack Later")
	        break;
	}
}





/* MONGO */ 
// (V) Mongo Variable
var mongoPort = process.env.MONGO_PORT;
var mongoURL = 'mongodb://localhost:' + mongoPort + '/caseybot'

mongoose.connect(mongoURL);
var db = mongoose.connection;

db.on('error', function (err) {
	console.log('Database Connection Error: ', err);
});

db.once('open', function () {
	botkitSpawnBotForCompanies()
	console.log('Database connected');
});



/* MONGO SCHEMES */
// (V) Mongo schema for videos
var videoSchema = mongoose.Schema({
    id: String
});

// (F) Mongo schema for videos
videoSchema.methods.getURL = function () {
	return 'https://www.youtube.com/watch?v=' + this.id
}

// (V) Mongo model for videos
var Video = mongoose.model('videos', videoSchema);


// (V) Mongo schema for companies
var companySchema = mongoose.Schema({
	teamID: String,
	teamName: String, 
	botID: String,
	botToken: String,
    globalToken: String
});

// (V) Mongo model for companies
var Company = mongoose.model('companies', companySchema);


// (F) Save model to database
function mongoSaveModel(obj) {
	obj.save(function (err) {
  		if (err) return handleError(err);
	})
}





/* BOTKIT */
// (V) Bot Array
var botArray = []

// (V) BotKit controller 
var controller = botkit.slackbot({
	log: false,
	debug: false
});
 

// (F) Spawn bot 
function botkitSpawnBot(token) {
	var bot = controller.spawn({
		token: token,
	}).startRTM()
	botArray.push(bot)
}

// (F) Spawn bot for every company
function botkitSpawnBotForCompanies() {
	Company.find({}, function(err, companies) {
		if(!err) {
			companies.forEach(function(company) {
				botkitSpawnBot(company.botToken)
			})
		}
	});
}


// (F) Get all channels bot is in
function botkitSendMessageToAllTeams(url) {
	botArray.forEach(function(bot) {
		bot.api.channels.list({},function(err, response) {
			if(!err) { 
				if(response.channels) {
					var channels = response.channels
					channels.forEach(function(channel) { 
						if(channel.is_member && !channel.is_archived) {
							bot.say({text: url, channel: channel.id});
						}
					})
				}
  			} else {
  				log(err)
  			}
		})
	})
}

// (F) Setup bot communication
controller.hears('hello',['direct_message','direct_mention','mention'],function(bot,message) {
	bot.reply(message,'Stop chatting! Do more.');
});





/* YOUTUBE */
// (V) Youtube Variable
var intervall = 30000
var part = 'contentDetails'
var api_key = process.env.GOOGLE_KEY;
var channelID = 'UCtinbF-Q-fVthA0qrFQTgXQ'
var youtube = google.youtube('v3');

// (F) Make Youtube Requests
var youtubeRequestIntervall = setInterval(function() { 
	youtube.activities.list({key: api_key, part: part, channelId: channelID, maxResults: 1}, function(err, res) {
		if(!err) {
			var upload = res.items[0].contentDetails.upload
			if(upload != undefined) {
				var videoID  = res.items[0].contentDetails.upload.videoId
				Video.find({ 'id': videoID }, function(err, videos) {
					if(!err && videos.length == 0) {
						// Test for Thumbnail ?
						videoUploaded(videoID)
					}
  				});
			}
		} else {
			log(err)
		}
	});
}, intervall);

// (F) Youtube Video Uploaded
function videoUploaded(videoID) {
	var currentVideo = new Video({ id: videoID });
	botkitSendMessageToAllTeams(currentVideo.getURL())
	mongoSaveModel(currentVideo)
}





/* OAUTH */
app.get('/oauth', function (req, res) {
	if(req.query.code != undefined) {
		var form = {
			code: req.query.code,
			client_id: "19474255650.38637281299",
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: "http://107.170.61.40:3000/oauth"
		}

		request.post({url:'https://slack.com/api/oauth.access', form: form}, function(err, httpResponse, body){
			if(!err) {
				var parsedBody = JSON.parse(body)
				if(parsedBody.ok) {
					caseybotCreateNewTeam(parsedBody)
					res.send('<html><body><h3> Succesfully Created! Visit Slack </h3></body></html>')
				} else {
					res.send('<html><body><h3> Error:' +  parsedBody + '</h3></body></html>')
				}	
			} else {
				log(err)
				res.send('<html><body><h3> Error </h3></body></html>')
			}
		})
	}
});

// (F) Caseybot create new team
function caseybotCreateNewTeam(body) {
	Company.find({ 'teamID': body.team_id}, function(err, companies) {
		if(!err && companies.length == 0) {
			var currentCompany = new Company({ 
				teamID: body.team_id,
				teamName: body.team_name, 
				botID: body.bot.bot_user_id, 
				botToken: body.bot.bot_access_token,
	    		globalToken: body.access_token
			});
			mongoSaveModel(currentCompany)
			botkitSpawnBot(body.bot.bot_access_token)
			log(currentCompany)
		} 
	})
}





/* WEBSITE ---> MOVE */
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