require('process')
require('dotenv').config()
const { spawn } = require('child_process');

const Discord = require('discord.js')
const discordClient = new Discord.Client()
const leetcodeClient = require('./external/leetcode-client')
const later = require('later');

var lastRequestDate;
var problemsChannel;
var problems = {
  'easy': "",
  'medium': "",
  'hard': ""
}

async function cleanupPinnedProblems() {
  const pins = await problemsChannel.fetchPinnedMessages()
  for (let [id, msg] of pins) {
    console.log(msg)
    msg.unpin();
    // msg.delete();
  };
}

function initProblemsChannel() {
  problemsChannel = discordClient.guilds
    .find(guild => guild.name == 'svarttest').channels
    .find(ch => ch.name == 'general')
}

discordClient.on('ready', async () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
  initProblemsChannel()
})

discordClient.on('message', async msg => {
  if (msg.author.username === 'leetcode-sprint-bot'
    && msg.content.startsWith('---------------')
    && !msg.pinned
  ) {
    msg.pin().catch(reason => { })
  }

  if (msg.content === 'help') {
    msg.reply(`
Hello! I am 'leetcode-a-day' bot. I will pick at random 
one hard problem every Monday,
one medium problem every Monday and Wednessday and
one easy problem every day, so you can practice non-stop.
    
Type 'problems' to see chosen problems.`)
  } else if (msg.content === 'problems') {

    var today = new Date().getDay()
    var todayDate = new Date().toDateString()
    msg.reply(`[${todayDate}] problems of a day:\n`)

    if (lastRequestDate != todayDate) {
      lastRequestDate = todayDate

      for (type in problems) {
        console.log('awaiting problem body')
        body = await leetcodeClient.getAny(type)
        console.log(body)
        problems[type] = body
        msg.reply(type + "-------------------\n" + problems[type])
      }
    } else {
      for (type in problems) {
        msg.reply(type + "-------------------\n" + problems[type])
      }
    }
  }
})


var sched = later.parse.recur()
  .every(5).minute();

later.setInterval(() => {
  console.log(new Date());
  problemsChannel.send("Wie geht's?")
}, sched);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  console.log(reason.stack)
});

discordClient.login(process.env.BOT_TOKEN)
