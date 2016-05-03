/* BOTKIT MODULE */
'use strict';

// Public Modules 
var botkit = require('botkit');
var Twitter = require('twitter');
var request = require('request');

// Private Modules
var youtube = require('./youtube');


// (V) Twitter Client Variable
var client

// (F) Set Twitter Client 
function setTwitterAPIKey(obj) {
	client = new Twitter({
		consumer_key: obj.consumer_key,
  		consumer_secret: obj.consumer_secret,
  		access_token_key: obj.access_token_key,
  		access_token_secret: obj.access_token_secret
	});
}


// (V) Botkit Array 
var botArray = []

// (V) BotKit Controller 
var controller = botkit.slackbot({
	log: false,
	debug: false
});



// (F) Spawn bot 
function spawnBot(token) {
	var bot = controller.spawn({
		token: token,
	}).startRTM()
	botArray.push(bot)
}




// (F) Send message to all teams
function sendMessageToAllTeams(url) {
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


// (F) Twitter Communication for Bot
controller.hears(['tweet', 'twitter', 'tweets'],['direct_message','direct_mention','mention'],function(bot,message) {
	client.get('statuses/user_timeline', {user_id: '154221292', count: 1}, function(err, tweets, response){
		if(!err) {
			var tweetID = tweets[0].id_str
			var tweetURL = 'https://twitter.com/CaseyNeistat/status/' + tweetID
			bot.reply(message, tweetURL);
		} else {
			log(err)
			bot.reply(message, 'Sorry, I have to work right know. Try later! #DoMore');
		}
	})
});





// (F) Youtube Communication for Bot
controller.hears(['youtube', 'video'],['direct_message','direct_mention','mention'],function(bot,message) {
	youtube.latestVideo(function(videoID) {
		bot.reply(message, 'https://www.youtube.com/watch?v=' + videoID);
	})
});

// (F) Youtube Communication for Bot
controller.hears(['beme', 'star trek', 'scotty'],['direct_message','direct_mention','mention'],function(bot,message) {
	bot.reply(message, "Beme up scotty! Got the joke, ok wasn't funny ... sry");
});





module.exports = {
	spawnBot: spawnBot,
	setTwitterAPIKey: setTwitterAPIKey,
	sendMessageToAllTeams: sendMessageToAllTeams
}