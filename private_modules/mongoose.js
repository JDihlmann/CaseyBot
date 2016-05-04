/* MONGOOSE MODULE */
'use strict';


// Modules 
var mongoose = require('mongoose');


function init(callback) {
	mongoose.connect('mongodb://localhost:27017/caseybot');
	var db = mongoose.connection;

	// (F) Database Avaible
	db.once('open', function () {
		callback()
	});

	// (F) Database Error
	db.on('error', function (err) {
		// Log in other Function
		console.log('Database Connection Error: ', err);
	});
}



// (S) Mongo Schemes
// (V) Mongo schema for videos
var videoSchema = mongoose.Schema({
    id: String
});

// (F) Mongo schema for videos
videoSchema.methods.getURL = function () {
	return 'https://www.youtube.com/watch?v=' + this.id
}

// (V) Mongo schema for companies
var companySchema = mongoose.Schema({
	teamID: String,
	teamName: String, 
	botID: String,
	botToken: String,
    globalToken: String
});

// (V) Mongo schema for companies
var facebookSchema = mongoose.Schema({
	id: String,
	token: String
});


// (M) Mongo Models
var Video = mongoose.model('videos', videoSchema);
var Company = mongoose.model('companies', companySchema);
var Facebook = mongoose.model('facebook', facebookSchema);



// (F) Save model to database
function saveModel(obj) {
	obj.save(function (err) {
  		if (!err) {

  		} else {
  			// Log Other Class
			console.log("(ERROR MONGO): Save Model")
			console.log(err)
  		}
	})
}



module.exports = {
	Video: Video,
	Company: Company,

	init: init,
	saveModel: saveModel
}