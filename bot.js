var os = require('os');
var fs = require('fs');
var http = require('http');
http.post = require('http-post');

var Botkit = require('botkit');

var briumUser = process.argv[2];
if (!briumUser) {
  console.log("Must specify brium user!");
  process.exit(1);
}

var main = function(slackToken, briumToken) {
  var controller = Botkit.slackbot({
      debug: true,
  });

  var bot = controller.spawn({
      token: slackToken
  }).startRTM();

  controller.hears(['.*'], 'direct_message', function(bot, message) {
    var postData = {
      user_name: briumUser,
      token: briumToken,
      text: message.text
    };

    http.post('http://brium.me/slack/slash_message', postData, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        bot.reply(message, chunk.toString());
      });
    })

  });
};


var mainSlackToken = process.env['SLACK_TOKEN'] || fs.readFileSync('.slack').toString().replace(/\\n|\s/g, '');
var mainBriumToken = process.env['BRIUM_TOKEN'] || fs.readFileSync('.brium').toString().replace(/\\n|\s/g, '');

main(mainSlackToken, mainBriumToken);
