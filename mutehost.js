/* created by twitch.tv/suprnova, thanks to ItsPepperPot and Pixel-Dog on GitHub for code edits and optimizations, thanks to the tmi.js team for their API. */
/* basic configuration options begin, see README.md for more information. */
var user = '<username>';
var pass = '<password>';
var channels = ['<channel(s)'];
var bitMultiplier = 0.5; // 0.5 seconds per bit
var subMultiplier = 125; // 125 seconds per sub
var giftSubMultiplier = 125; // 125 seconds per gift sub
/* configuration options end */

const tmi = require('tmi.js');
const robot = require('robotjs');
const opts = {
	identity: {
		username: user,
		// don't share this token publicly vv
		password: pass
	},
	channels: channels
};
const client = new tmi.client(opts);

client.on('connected', onConnectedHandler => {
	client.say(channels[0], `Connected to chat.`);
});

client.connect();

client.on("cheer", (channel, userstate, message) => {
	//changes between bits and bit when appropriate
	console.log(`cheer received for ${userstate.bits} bit${userstate.bits === 1 ? '' : 's'}`);

	let bitMuteDuration = userstate.bits * bitMultiplier;

	client.say(channel, `Muting for ${bitMuteDuration} second${bitMuteDuration === 1 ? '' : 's'}`);
	muteHost(bitMuteDuration);
});

client.on("subscription", (channel, username, method, message, userstate) => {
	console.log(`subscription received`)
	client.say(channel, `Muting for ${subMultiplier} seconds`);
	muteHost(subMultiplier);
});

client.on("resub", (channel, username, months, message, userstate, methods) => {
	console.log(`resub received`)
	client.say(channel, `Muting for ${subMultiplier} seconds`);
	muteHost(subMultiplier);
});

client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
	console.log(`gift subscription received`)
	client.say(channel, `Muting for ${giftSubMultiplier} seconds`);
	muteHost(giftSubMultiplier);
});

client.on("submysterygift", (channel, username, numbOfSubs, methods, userstate) => {
	console.log(`mystery gift subscription received`)
	client.say(channel, `Muting for ${giftSubMultiplier} seconds`);
	muteHost(giftSubMultiplier);
});

var lastMuteTimeStamp = new Date();
var outstandingMuteTime = 0; //ms
var timer;

function muteHost(time) {
	let timeMS = time * 1000
	msSinceLastMute = Math.abs(Date.now() - lastMuteTimeStamp);
	lastMuteTimeStamp = Date.now();
	if (msSinceLastMute < outstandingMuteTime) {
		//outstanding mute time hasn't been run down yet; this means that we need to clear the old timeout and run a new one
		outstandingMuteTime = outstandingMuteTime - msSinceLastMute + timeMS;
		console.log(`mute extended to ${outstandingMuteTime / 1000} seconds`);
		clearTimeout(timer);
	} else {
		//no outstanding mute, start a new timeout and trigger a mute
		outstandingMuteTime = timeMS;
		//change these to the keybind you use to mute, see http://robotjs.io/docs/syntax#keys for more help.
		robot.keyToggle('control', 'down');
		robot.keyTap('insert');
		robot.keyToggle('control', 'up');
		console.log(`muted host for ${outstandingMuteTime / 1000} seconds`);
	}

	timer = setTimeout(function () {
		robot.keyToggle('control', 'down');
		robot.keyTap('insert');
		robot.keyToggle('control', 'up');
		console.log('unmuted host');
	}, outstandingMuteTime);
}

function onConnectedHandler(addr, port) {
	console.log(`* Connected to ${addr}:${port}`);
}
/* Note to contributors, update the README.md line numbers to reflect any changes you've made for each commit. */