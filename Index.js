const Discord = require("discord.js")
const tokenpath = require("../token.json")
const config = require('./config.json')
const fs = require('fs')

var bot = new Discord.Client()

bot.on("ready", async function() {
  console.log("Bot launched. Running Version: "+ config.version)
})
function LoadLogin() {
  if (config.useToken === 'false') bot.login(tokenpath.token); 
  else clientInformation.login(config.token);
}

bot.on('message', async function(message) {
  console.log(message.content);
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  var args = message.content.substring(config.prefix.length).split(/\s+/);
    switch(args[0].toLowerCase()) {
      
  case 'ping':
    message.channel.send('Pong.');
    break;

  case 'stop':
    message.channel.send('Goodbye!').then(m => {
    bot.destroy()});
    break;

  case 'restart':
    message.channel.send('Restarting...');
    bot.destroy();
    LoadLogin();
    break;

  case 'join':
    if(message.member.voice.channel == null) {
      message.channel.send('please join a Channel first!')
    return; }
    message.member.voice.channel.join();
    console.log(`Joined ${message.member.voice.channel.name}.`)
    message.channel.send("Joined `" + message.member.voice.channel.name + "`.")
    break;

  case 'leave':
    console.log(`Left ${message.guild.voice.connection.channel.name}.`)
    message.channel.send("Left `" + message.guild.voice.connection.channel.name + "`.")
    message.guild.voice.connection.disconnect()
    break;
  case 'sound': 
  fs.readdir('./Sounds', () => {
      if(args[1] === 'add') message.channel.send('Adding Sound to the Board')

      else if(args[1] === 'play') {message.channel.send('Playing Sound' + '...')   //HIER NOCH SOUNDDISPLAY
                                   message.guild.voice.connection.play('./run.mp3')} //wie spielt man einen Ton ab?
      else message.channel.send('Please use //sound [play/add] [title] or NameYourSoundWithoutSpace')

    })
  }
});

LoadLogin();