require('process')
require('dotenv').config()

const nearley = require("nearley");
const grammar = require("./problem-grammar.js");
const problemParser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const Discord = require('discord.js')
const discordClient = new Discord.Client()
const leetcodeClient = require('./external/leetcode-client')
const later = require('later');

const prefix = "!";
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

async function renewProblemOfADay(hardness) {
  const pinned = await problemsChannel.fetchPinnedMessages()
  for([id, old] of pinned) {
    console.log('old msg')
    console.log(old.content)
    console.log('parse result')
    console.log(problemParser.feed(old.content))
    var problemMsg = problemParser.feed(old.content)[0]
    if(problemMsg.hardnes === hardness) {
      var today = (new Date()).toDateString
      if (problemMsg.date !== today) {
        problemMsg.unpin()
        newProblemBody = await leetcodeClient.getAny(hardness)
        problemsChannel.send(`[${today}][${hardness}]\n${newProblemBody}`)
      }
    }
  }
  const body = await leetcodeClient.getAny(hardness)
}

discordClient.on('ready', async () => {
  console.log(`Logged in as ${discordClient.user.tag}!`)
  await initProblemsChannel()
})

discordClient.on("message", async msg => {
  if (msg.channel.type !== "text") return;
  if (!msg.content.startsWith(prefix)) return;
  // if (!msg.channel.permissionsFor(client.user).has("SEND_MESSAGES")) return;

  const args = msg.content.split(" ").slice(1);
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
      for ([id, problem] of pinned) {
        console.log(problem)
        msg.reply("\n" + problem.content)
      }
      break;
  }
})

var sched = later.parse.recur()
  .every(5).minute();

later.setInterval(async () => {
  console.log(new Date());
  problemsChannel.send("Wie geht's?")
  renewProblemOfADay("Easy")
}, sched);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  console.log(reason.stack)
});

discordClient.login(process.env.BOT_TOKEN)
