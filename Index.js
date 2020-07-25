const Discord = require("discord.js")
const config = require('./config.json')
const fs = require('fs')

var bot = new Discord.Client()

/* -------------- Functions: -------------- */
function LoadLogin() {
  if (config.token == '') bot.login(require("../token.json").token); 
    else bot.login(config.token) }

var playFile = function playFile(sound, channelid) {
  bot.voice.connections.find(c => c.channel.id == String(channelid)).play("./Sounds/" + loadedSounds[sound] + ".mp3") }


/* -------------- Events: -------------- */
bot.on("ready", async function() {
  console.log("Bot launched. Running Version: "+ config.version)

  fs.readdir('./Sounds', (err, files) => { 
    if(err) console.log('error: ' + err)

    loadedSounds = files.filter(f => f.split('.').pop() === 'mp3')
    loadedSounds.forEach((e, i) => {
      loadedSounds[i] = e.replace(".mp3", "") })

    module.exports.loadedSounds = loadedSounds
    console.log(loadedSounds.length + ' Sound(s) loaded.')

    if (config.usewebserver) require("./webserver.js").run(loadedSounds, playFile) //Webserver is enabled? Run it.
   })
})


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
    bot.destroy() });
    break;

  case 'restart':
    message.channel.send('Restarting...');
    bot.destroy();
    setTimeout(() => {
      LoadLogin();
    }, 1000);
    break;

  case 'help':
    message.channel.send('Bot-Commands:\n//ping\n//stop\n//restart (This Command doesn´t load new Content)\n//join\n//leave\n//sound (Type sound for more help))')
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
    //if(args[1] === 'add') {message.channel.send('Adding Sound to the Board')}
    if(args[1] === 'list') message.channel.send(loadedSounds) //else if
    else if(args[1] === 'dplay') {
      message.channel.send('Playing Sound')
      message.member.guild.voice.connection.play(message.attachments.array()[0]["attachment"]) }
    else if(args[1] === 'play') {
      message.channel.send('Playing Sound: ' + args[2])
      message.member.guild.voice.connection.play('./Sounds/'+ args[2]+'.mp3') }
    else message.channel.send('Please use //sound play [title], \nsend a mp3 with the Comment "//sound dplay" or \nadd a Sound to the Folder')
    break;

  }
});

module.exports={
  playFile
}

LoadLogin();