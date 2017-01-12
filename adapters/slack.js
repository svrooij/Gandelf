var Bottleneck = require("bottleneck");
var Bot = require('slackbots');

var bot_token = process.env.SLACK_API_TOKEN || '';
var rate_limit = process.env.RATE_LIMIT || 400; // 400 milliseconds between messages

var settings = {
    token: bot_token,
    name: 'gandelf'
};

var bot = new Bot(settings);

var limiter = new Bottleneck(0, 400);

general = 'general'
var channels = {};

bot.on('channel_joined', (evt) => {
	console.log('Channel joined');
	console.log(evt);
	channels[evt.channel.name] = evt.channel.name;
})

bot.on('start',  () => {
	bot.getChannels().always((chans) => {
		let chanlist = '';
		for (const chan of chans._value.channels) {
			if (chan.is_member) {
				channels[chan.name] = chan.name;
				chanlist += `${chan.name} `;
			}
		}
		init = true;
		announce('general', `Gandelf alive. Currently in these channels: ${chanlist}`);
	});
});

const announce = (channel, msg) => { 
	const send = (text) => { 
		console.log(text);
		return new Promise( (resolve, reject) => {
			bot.postMessageToChannel(channel, text).always((data) => resolve);
		});
	}

	let txt;
	if (typeof msg === "string") { txt = msg }
	if (msg && msg.short_message) { txt = msg.short_message }

	limiter.schedule(send, txt).then((data)=> console.log); 
}

function slackMessage(msg, name) {
	if (channels[name]) { return announce(channels[name], msg) }
	announce(general, `${name} - ${msg}`);
}

module.exports.slackMessage = slackMessage;