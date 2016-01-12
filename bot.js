var os = require('os');
var fs = require('fs');
var http = require('http');
http.post = require('http-post');
var _ = require('lodash');
var Botkit = require('botkit');

var briumUrl = 'http://brium.me';

var main = function(slackToken, briumToken) {
  var users = null;

  var controller = Botkit.slackbot({
    debug: true,
  });

  var bot = controller.spawn({
    token: slackToken
  }).startRTM(function(err, bot, payload) {
    users = payload.users;
  });

  var findUser = function(id) {
    return _.find(users, function(user) {
      return user.id == id;
    });
  };

  controller.hears(['.*'], 'direct_message', function(bot, message) {
    var postData = {
      user_id: message.user,
      user_name: findUser(message.user).name,
      token: briumToken,
      text: message.text
    };

    http.post(briumUrl + '/slack/slash_message', postData, function(res) {
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
