/* FACEBOOK MODULE */
'use strict';

// Private modules
var log = require('./log');
var botkit = require('./botkit');
var mongoose = require('./mongoose');


// (V) Botkit handler variables
var controller = botkit.botkit.facebookbot({ 
	log: false, 
	debug: false,
	access_token: process.env.FB_ACCESS_TOKEN, 
	verify_token: process.env.FB_VERIFY_TOKEN
})

var responseActivation = 'message_received'
var botkitHandler = new botkit.Handler(controller, responseActivation)
var bot = botkitHandler.controller.spawn({});




/* Additional Messaging */
// Triggerded when user clicks the add-to-messenger button
function additionalMessaging() { 
	botkitHandler.controller.on('facebook_optin', function(bot, message) {
		log.out(bot)
	 	bot.reply(message, 'Welcome to my app!');
	});
}


// (F) Spawn bot  
function spawnBot() { 
	var bot = botkitHandler.controller.spawn({});
	
	// botkitHandler.controller.setupWebserver(1040, function(err, webserver) {
 //  		botkitHandler.controller.createWebhookEndpoints(controller.webserver, bot, function() {
 //      		log.out('Bot went online!');
 //  		});
	// });
	additionalMessaging()
}


// (F) Spawn all users 
function spawnAllUsers(tokenObject) {
	mongoose.Facebook.find({}, function(err, users) {
		if(err) {
			users.forEach(function(user) { 
				botkitHandler.botArray.push(user.id)
			})
		} else {
			log.err(err)
		}
	})
}


// (F) Send messages to all user
function sendMessageToAllUser(url) {
	botkitHandler.botArray.forEach(function(user) {
		// ???
	})
}

// (F) Create new user 
function createNewUser(id) {
	mongoose.Facebook.find({ 'id': id}, function(err, user) {
		if(!err && user.length == 0) {
			var currentUser = new mongoose.Facebook({ id: id });
			mongoose.saveModel(currentUser)
			spawnBot(body.bot.bot_access_token)
			log.out(currentCompany)
		} else {
			log.err(err)
		}
	})
}



module.exports = {
	mongoose: mongoose,

	spawnBot: spawnBot,
    spawnAllUsers: spawnAllUsers,
    sendMessageToAllUser: sendMessageToAllUser 
}