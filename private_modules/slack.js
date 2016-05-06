/* SLACK MODULE */
'use strict';

// Public modules
var request = require('request');

// Private modules
var log = require('./log');
var botkit = require('./botkit');
var mongoose = require('./mongoose');


// (V) Botkit handler variables
var controller = botkit.botkit.slackbot({log: false, debug: false})
var responseActivation = ['direct_message','direct_mention','mention']
var botkitHandler = new botkit.Handler(controller, responseActivation)



// (F) Spawn bot 
function spawnBot(token) {
    var bot = botkitHandler.controller.spawn({token: token}).startRTM()
    botkitHandler.botArray.push(bot)
}

// (F) Spawn all bots
function spawnAllBots() {
	mongoose.Slack.find({}, function(err, companies) {
		if(!err) {
			companies.forEach(function(company) {
				spawnBot(company.botToken)
			})
		} else {
			log.err(err)
		}
	});
}

// (F) Send messages to all teams
function sendMessageToAllTeams(url) {
	botkitHandler.botArray.forEach(function(bot) {
		bot.api.channels.list({}, function(err, res) {
            if(!err) { 
                var channels = res.channels
                channels.forEach(function(channel) { 
                   	if(channel.is_member && !channel.is_archived) {
                        bot.say({text: url, channel: channel.id});
                    }
                })
            } else {
                log.err(err)
            }
		})
	})
}

// (F) Create new team 
function createNewTeam(body) {
	mongoose.Slack.find({ 'teamID': body.team_id}, function(err, companies) {
		if(!err && companies.length == 0) {
			var currentCompany = new mongoose.Slack({ 
				teamID: body.team_id,
				teamName: body.team_name, 
				botID: body.bot.bot_user_id, 
				botToken: body.bot.bot_access_token,
	    		globalToken: body.access_token
			});

			mongoose.saveModel(currentCompany)
			spawnBot(body.bot.bot_access_token)
			log.out(currentCompany)
		} else {
			log.err(err)
		}
	})
}

// (F) OAuth handler
function oauthHandler(req, callback) {
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
					callback('Succesfully Created! Visit Slack')
				} else {
					callback(parsedBody)
				}	
			} else {
				log.err(err)
				callback(err)
			}
		})
	}
}


module.exports = {
	mongoose: mongoose,

    spawnBot: spawnBot,
    oauthHandler: oauthHandler,
    spawnAllBots: spawnAllBots,
    sendMessageToAllTeams: sendMessageToAllTeams
}