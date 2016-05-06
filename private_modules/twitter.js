/* TWITTER MODULE */
'use strict';

// Public Modules
var Twitter = require('twitter');

// Private modules
var log = require('./log');

// (V) Twitter Client Variable
var twitter = new Twitter({
	consumer_key: process.env.CONSUMER_KEY,
  	consumer_secret: process.env.CONSUMER_SECRET,
  	access_token_key: process.env.ACCESS_TOKEN_KEY,
  	access_token_secret: process.env.ACCESS_TOKEN_SECRET
 });


function getTweet(callback) {
	twitter.get('statuses/user_timeline', {user_id: '154221292', count: 1}, function(err, tweets, response){
       	if(!err) {
         	var tweetID = tweets[0].id_str
            var tweetURL = 'https://twitter.com/CaseyNeistat/status/' + tweetID
            callback(tweetURL)
       	} else {
          	log.err(err)
          	callback('Sorry, I have to work right know. Try later! #DoMore')
        }
    })

}


module.exports = {
	getTweet: getTweet
}