require('dotenv').config()
const { spawn } = require('child_process');
const Discord = require('discord.js')
const client = new Discord.Client()

var lastRequestDate;
var problems = {
  'easy': "",
  'medium': "",
  'hard': ""
}

function getProblemStream(hardness) {
  const proc = spawn('/usr/local/bin/leetcode', ['show', '-q', hardness]);
  return proc.stdout
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', msg => {
  if (msg.content === 'help') {
    msg.reply(`
Hello! I am 'leetcode-a-day' bot. I will pick at random 
one hard problem every Monday,
one medium problem every Monday and Wednessday and
one easy problem every day, so you can practice non-stop.
    
Type 'problems' to see chosen problems.`)
  }

  else if (msg.content === 'problems') {
    var today = new Date().getDay()
    var todayDate = new Date().toDateString()
    msg.reply(`[${todayDate}] problems of a day:\n`)

    if(lastRequestDate != todayDate) {
      lastRequestDate = todayDate
      
      for(type in problems) {
        if (type == 'medium' && ![1, 3, 4].includes(today)) continue;
        if (type == 'hard' && today != 1) continue;

          (function(hardness) {
            var problemText = ""
            const stream = getProblemStream(hardness[0])
            stream.on('data', (data) => {
              problemText += data
            });
            stream.on('close', (code) => {
              problems[hardness] = problemText.split('\n').slice(0,4).join("\n");
              msg.reply(hardness + "-------------------\n" + problems[hardness])
            });
          })(type);
      }
    } else {
      for(type in problems) {
        msg.reply(type + "-------------------\n" + problems[type])
      }
    }
  }
})

client.login(process.env.BOT_TOKEN)
