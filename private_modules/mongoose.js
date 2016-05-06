/* MONGOOSE MODULE */
'use strict';


// Public modules 
var mongoose = require('mongoose');

// Private modules
var log = require('./log');


// Init mongoose
mongoose.connect('mongodb://localhost:27017/caseybot');
var db = mongoose.connection;



/* Mongo Schemes */ 
// (V) Mongo schema for videos
var videoSchema = mongoose.Schema({
    id: String
});

// (F) Mongo schema for videos
videoSchema.methods.getURL = function () {
	return 'https://www.youtube.com/watch?v=' + this.id
}

// (V) Mongo schema for companies
var slackSchema = mongoose.Schema({
	teamID: String,
	teamName: String, 
	botID: String,
	botToken: String,
    globalToken: String
});

// (V) Mongo schema for companies
var facebookSchema = mongoose.Schema({
	userID: String,
	userName: String
});



// (M) Mongo Models
var Video = mongoose.model('videos', videoSchema);
var Slack = mongoose.model('slack', slackSchema);
var Facebook = mongoose.model('facebook', facebookSchema);


// (F) Save model to database
function saveModel(obj) {
	obj.save(function (err) {
  		if (!err) {

  		} else {
  			log.err(err)
  		}
	})
}


function init(callback) {
	db.once('open', function () {
		callback()
	});

	db.on('error', function (err) {
		log.err(err)
	});
}



module.exports = {
	Video: Video,
	Slack: Slack,
	Facebook: Facebook,

	init: init,
	saveModel: saveModel
}