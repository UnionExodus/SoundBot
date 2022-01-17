const Discord      = require("discord.js")
const DiscordVoice = require("@discordjs/voice")
const fs           = require('fs')
const https        = require('https');

const commands     = require('./bot_modules/commands.json')
const config       = require('./config.json')

const bot       = new Discord.Client({ intents: [ Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_VOICE_STATES ] });
bot.addons      = new Discord.Collection();
bot.bot_modules = new Discord.Collection();
bot.loadedSounds = [];


/* -------------- Functions: -------------- */
function loadLogin() {
    if (config.token == '') bot.login(require("../token.json").token); 
        else bot.login(config.token) 
}

var playFile = function playFile(sound, channelid) { //exported function that allows to play a sound from other files (webserver)
    if (bot.voice.connections.find(c => c.channel.id == String(channelid)) == undefined) bot.voice.joinChannel(bot.channels.cache.get(String(channelid)));

    bot.voice.connections.find(c => c.channel.id == String(channelid)).play("./Sounds/" + bot.loadedSounds[sound] + ".mp3"); //find the channelid's corresponding voice connection
}
  


/* -------------- Events: -------------- */
bot.on("ready", async function() {
    console.log("\nSoundBot launched. Running Version: " + config.version)

    //set it once at startup, then let the Interval do it
    bot.user.setPresence({ activities: [{ name: config.games[0] }], status: 'online' })

    var currentgameindex = 1

    var gamerotationloop = setInterval(() => { //interval has a name to be able to clear it (for what ever reason): clearInterval(gamerotationloop)
        bot.user.setPresence({ activities: [{ name: config.games[currentgameindex] }], status: 'online' })

        currentgameindex++
        if (currentgameindex == config.games.length) currentgameindex = 0
    }, config.gamerotateseconds * 1000);

    //Sound reader
    fs.readdir('./Sounds', (err, files) => {
        if (err) console.log('error: ' + err)

        bot.loadedSounds = files.filter(f => f.split('.').pop() === 'mp3')
        bot.loadedSounds.forEach((e, i) => {
            bot.loadedSounds[i] = e.replace(".mp3", "")
        })

        console.log(bot.loadedSounds.length + ' Sound(s) loaded.')

        if (config.usewebserver) require("./webserver.js").run(bot, playFile) //Webserver is enabled? Run it.
    })

    //bot_modules reader
    /*
    Commands.json laden
    einzelne Keys lesen: Object.keys(commands) for each
    collection erstellen für command zu datei und subcommands parameter
    subcommands checken (existenz) und deren keys lesen und zu subcommands parameter hinzufügen

    message event muss argument 1 checken und schauen, ob dies ein subcommand ist true: subcommand false: run
     */

    //Addons reader
    fs.readdir('./Addons/', (err, files) => {
        if (err) console.error(err);

        var jsfiles = files.filter(f => f.split('.').pop() === 'js');
        jsfiles.splice(jsfiles.indexOf("blank.js"), 1) //remove blank command

        jsfiles.forEach((f, i) => {
            var addon = require(`./Addons/${f}`);
            bot.addons.set(addon.config.name, addon);
        })

        if (jsfiles.length <= 0) return;
            else console.log("-> " + jsfiles.length + " addon(s) found.")
    })


    setTimeout(() => { 
        console.log("");
    }, 500)
})


bot.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    var args = message.content.substring(config.prefix.length).split(/\s+/);

    //Commands

    for(i = 1; commands.length; i++) {

        if(args[0].toLowerCase() == commands[i]) {console.log("funzt")} else

            for(f = 1; commands[i].length; i++){

                if(args[0].toLowerCase() == commands[i].alias[f]) console.log("yeee");

            }
    }

});

module.exports={
    playFile
}

loadLogin();