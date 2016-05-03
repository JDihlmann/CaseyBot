// Express Module 
var express = require('express');
var app = express();

// Public Modules
var request = require('request');
var server = require('http').createServer(app); 


// Private Modules 
var botkit = require('./private_modules/botkit');
var youtube = require('./private_modules/youtube');
var mongoose = require('./private_modules/mongoose');



/* SERVER */
var port = 1040
server.listen(port);
console.log("Server started on " + port);



/* MONGOOSE */
// (F) Mongoose init
mongoose.init(function() {
	console.log("Database Connected")
	//facebookSpawn
	botkitSpawnAllBots()
	youtubeStartRequestIntervall()
})

// (F) Caseybot create new team
function createNewTeam(body) {
	mongoose.Company.find({ 'teamID': body.team_id}, function(err, companies) {
		if(!err && companies.length == 0) {
			var currentCompany = new mongoose.Company({ 
				teamID: body.team_id,
				teamName: body.team_name, 
				botID: body.bot.bot_user_id, 
				botToken: body.bot.bot_access_token,
	    		globalToken: body.access_token
			});

			mongoose.saveModel(currentCompany)
			botkit.spawnBot(body.bot.bot_access_token)
			console.log(currentCompany)
		} 
	})
}





/* YOUTUBE */
// (M) Youtube Module Parameter
youtube.setAPIKey(process.env.GOOGLE_KEY);


// (F) Youtube Start Request Intervall
function youtubeStartRequestIntervall() {
	youtube.startRequestIntervall(youtubeVideoCheck)
}


// (F) Youtube Video Uploaded
function youtubeVideoCheck(videoID) {
	mongoose.Video.find({ 'id': videoID }, function(err, videos) {
		if(!err && videos.length == 0) {
			youtube.videoThumbnail(videoID, youtubeVideoUploaded)
		}
	});
}

// (F) Youtube Video Uploaded
function youtubeVideoUploaded(videoID) {
	var currentVideo = new mongoose.Video({ id: videoID });
	mongoose.saveModel(currentVideo)
	//facebook.functionName(currentVideo.getURL(), title, image)
	botkit.sendMessageToAllTeams(currentVideo.getURL())
}



/* BOTKIT */
// (M) Botkit Twitter Module Parameter
botkit.setTwitterAPIKey({
	consumer_key: process.env.CONSUMER_KEY,
  	consumer_secret: process.env.CONSUMER_SECRET,
  	access_token_key: process.env.ACCESS_TOKEN_KEY,
  	access_token_secret: process.env.ACCESS_TOKEN_SECRET
 })


// (F) Botkit Start All Bots
function botkitSpawnAllBots() {
	mongoose.Company.find({}, function(err, companies) {
		if(!err) {
			companies.forEach(function(company) {
				botkit.spawnBot(company.botToken)
			})
		}
	});
}





/* OAUTH */
app.get('/oauth', function (req, res) {
	if(req.query.code != undefined) {
		var form = {
			code: req.query.code,
			client_id: "19474255650.38637281299",
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: "http://angst.wtf/oauth"
		}

		request.post({url:'https://slack.com/api/oauth.access', form: form}, function(err, httpResponse, body){
			if(!err) {
				var parsedBody = JSON.parse(body)
				if(parsedBody.ok) {
					createNewTeam(parsedBody)
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


// /* WEBSITE ---> MOVE */
app.get('/', function (req, res) {
	var testString = '<a href="https://slack.com/oauth/authorize?scope=bot&client_id=19474255650.38637281299"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>'
	mongoose.Company.find({}, function(err, companies) {
		if(!err) {
			res.send('<html><body><h3>' + testString + '</body></html>');
		} else {
			res.send('<html><body><h3> Error </h3>' + testString + '</body></html>');
		}
  	});
});