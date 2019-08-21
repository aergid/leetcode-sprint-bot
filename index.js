require('process')
require('dotenv').config()

const nearley = require("nearley");
const grammar = require("./problem-grammar.js");
const later = require('later');

const Discord = require('discord.js')
const discordClient = new Discord.Client()
const leetcodeClient = require('./external/leetcode-client')
const prefix = "!";
var problemsChannel;


async function cleanupPinnedProblems() {
  const pins = await problemsChannel.fetchPinnedMessages()
  for (let [id, msg] of pins) {
    msg.unpin();
  };
}

function initProblemsChannel() {
  problemsChannel = discordClient.guilds
    .find(guild => guild.name === process.env.GUILD).channels
    .find(ch => ch.name === process.env.CHANNEL)
}

function getProblemParser() {
  return new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
}

function parseStoredProblem(problem) {
  const problemParser = getProblemParser()
  return problemParser.feed(problem).finish()[0]
}

async function renewProblemOfADay(hardness) {
  const pinned = await problemsChannel.fetchPinnedMessages()
  var problemsByType = {};
  problemsByType[hardness] = null

  var messagesByType = {};

  for([id, msg] of pinned) {
    var problemMsg = parseStoredProblem(msg.content)
    problemsByType[problemMsg.hardness] = problemMsg 
    messagesByType[problemMsg.hardness] = msg
  }
  var today = (new Date()).toDateString()
 
  if(!problemsByType[hardness] || problemsByType[hardness].date !== today) {
    newProblemBody = await leetcodeClient.getAny(hardness)
    var newMsg = await problemsChannel.send(`[${today}][${hardness}]\n${newProblemBody}`)
    newMsg.pin()

    console.log(!messagesByType[hardness])
    if(messagesByType[hardness]) {
      messagesByType[hardness].unpin()
    }
  }
}

discordClient.on('ready', async () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
  await initProblemsChannel()
})

discordClient.on("message", async msg => {
  if (msg.channel.type !== "text") return;
  if (!msg.content.startsWith(prefix)) return;
  if (!msg.channel.permissionsFor(discordClient.user).has("SEND_MESSAGES")) return;

  const cmd = msg.content.slice(prefix.length).split(" ")[0];

  switch (cmd) {
    case "help":
      msg.channel.send(`
Hello! I am 'leetcode-a-day' bot. I will pick at random 
one hard problem every Monday,
one medium problem every Monday and Wednessday and
one easy problem every day, so you can practice non-stop.
    
Type '${prefix}list' to see chosen problems.`
      );
      break;

    case "list":
      const pinned = await problemsChannel.fetchPinnedMessages()
      for ([id, problemMsg] of pinned) {
        msg.reply("\n" + problemMsg.content)
      }
      break;
  }
})

var everyDaySched = later.parse.recur()
.on(10).hour().onWeekday()

var everyMonAndWedSched = later.parse.recur()
.on(10).hour().on(2,4).dayOfWeek()

var everyMonSched = later.parse.recur()
.on(10).hour().on(2).dayOfWeek()

later.setInterval(async () => {
  renewProblemOfADay("Easy")
}, everyDaySched);

later.setInterval(async () => {
  renewProblemOfADay("Medium")
}, everyMonAndWedSched);

later.setInterval(async () => {
  renewProblemOfADay("Hard")
}, everyMonSched);


process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  console.log(reason.stack)
});

discordClient.login(process.env.BOT_TOKEN)
