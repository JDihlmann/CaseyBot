/* BOTKIT MODULE */
'use strict';

// Public modules 
var botkit = require('botkit');

// Private modules
var log = require('./log');
var twitter = require('./twitter');
var youtube = require('./youtube');



// (V) Handler
function Handler(controller, responseActivation) {

	/* VARIABLES */
	// (V) Itself
    var self = this 

    // (V) Bot array
    this.botArray = []

    // (V) BotKit controller 
    this.controller = controller

    // (V) Message repsone activation
    this.responseActivation = responseActivation


    /* MESSAGES */
    // (F) Twitter Communication for Bot
    self.controller.hears(['tweet', 'twitter', 'tweets'], self.responseActivation, function(bot, message) {
    	twitter.getTweet(function(text) {
    		bot.reply(message, text);
    	})
    });

    // (F) Youtube Communication for Bot
    self.controller.hears(['youtube', 'video'], self.responseActivation, function(bot,message) {
        youtube.latestVideo(function(videoID) {
            bot.reply(message, 'https://www.youtube.com/watch?v=' + videoID);
        })
    });

    // (F) Youtube Communication for Bot
    self.controller.hears(['beme', 'star trek', 'scotty'], self.responseActivation, function(bot,message) {
        bot.reply(message, "Beme up scotty! Got the joke, ok wasn't funny ... sry");
    });

    self.controller.hears('test', self.responseActivation, function(bot,message) {
    	bot.api.chat.postMessage({
    		as_user: true,
    		channel: message.channel,
    		text: "<https://www.youtube.com/watch?v=yGtza5cGgK0|   >",
    		attachments: [{
    			color: "#36a64f",
            	text: "<https://www.youtube.com/watch?v=yGtza5cGgK0|Vlog 22> I am a test message",
            	fields: [
                {
                    "title": "Priority",
                    "value": "High",
                    "short": false
                }
            ],
			}]

    	}, function (err, response) {

    		console.log(response)
    	})
    });
}



module.exports = {
	botkit: botkit,
    Handler: Handler
}