/* LOG MODULE */
'use strict';


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