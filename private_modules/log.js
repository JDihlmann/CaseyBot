/* LOG MODULE */
'use strict';


/* LOG HANDLER */
// (V) Log in Slack
//var logTarget= process.env.LOG_TARGET

// (F) Out messages
function out(message) {
	console.log(message)
}

// (F) Err messages
function err(message) {
	console.log(message)
}


module.exports = {
    out: out,
    err: err
}