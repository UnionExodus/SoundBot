const Discord = require("discord.js")
const tokenpath = require("../token.json")
const config = require('./config.json')
const fs = require('fs')

var bot = new Discord.Client()

bot.on("ready", async function() {
  console.log("Bot launched. Running Version: "+ config.version)

  fs.readdir('./Sounds', (err, files) => { 
    if(err)console.log('error: '+ err )
    loadedSounds = files.filter(f => f.split('.').pop() === 'mp3')
    console.log(loadedSounds.length + ' Sound(s) loaded.')
   })
})
function LoadLogin() {
  if (config.useToken === 'false') bot.login(tokenpath.token); 
  else clientInformation.login(config.token);
}

bot.on('message', async function(message) {
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
  case 'help':
    message.channel.send('No help today.')
    break;
  case 'join':
    if (message.member.voice.channel == null) { //Check if the user is in a voice channel
      message.channel.send("Please join a voice channel first!")
      return; }
    if(message.member.voice.channel == null) {
      message.channel.send('please join a Channel first!')
    return; }
    message.member.voice.channel.join();
    console.log(`Joined ${message.member.voice.channel.name}.`)
    message.channel.send("Joined `" + message.member.voice.channel.name + "`.")
    break;

  case 'leave':
    if(!bot.guilds.cache.get(message.guild.id).voice || bot.guilds.cache.get(message.guild.id).voice.channelID == null) return message.channel.send('I am not connected to any voice channel!\nIf I am still in a voice channel please wait or disconnect me manually.')
    console.log(`Left ${message.guild.voice.connection.channel.name}.`)
    message.channel.send("Left `" + message.guild.voice.connection.channel.name + "`.")
    message.guild.voice.connection.disconnect()
    break;
  case 'sound': 
      if(args[1] === 'add') message.channel.send('Adding Sound to the Board')
      else if(args[1] === 'list')  message.channel.send(loadedSounds)
      else if(args[1] === 'play') {message.channel.send('Playing Sound' + '...')   //HIER NOCH SOUNDDISPLAY
                                   message.member.guild.voice.connection.play('./SadViolin.mp3')} //wie spielt man einen Ton ab?
      else message.channel.send('Please use //sound [play/add] [title] or NameYourSoundWithoutSpace')

   
  }
});

LoadLogin();