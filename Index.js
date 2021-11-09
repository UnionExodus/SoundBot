const Discord      = require("discord.js")
const DiscordVoice = require("@discordjs/voice")
const fs           = require('fs')
const https        = require('https');

const config       = require('./config.json')

const bot       = new Discord.Client({ intents: [ Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_VOICE_STATES ] });
bot.addons      = new Discord.Collection();

const player    = DiscordVoice.createAudioPlayer();

var loadedSounds = []


/* -------------- Functions: -------------- */
function loadLogin() {
    if (config.token == '') bot.login(require("../token.json").token); 
        else bot.login(config.token) 
}

var playFile = function playFile(sound, channelid) { //exported function that allows to play a sound from other files (webserver)
    if (bot.voice.connections.find(c => c.channel.id == String(channelid)) == undefined) bot.voice.joinChannel(bot.channels.cache.get(String(channelid)));

    bot.voice.connections.find(c => c.channel.id == String(channelid)).play("./Sounds/" + loadedSounds[sound] + ".mp3"); //find the channelid's corresponding voice connection
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

        loadedSounds = files.filter(f => f.split('.').pop() === 'mp3')
        loadedSounds.forEach((e, i) => {
            loadedSounds[i] = e.replace(".mp3", "")
        })

        module.exports.loadedSounds = loadedSounds
        console.log(loadedSounds.length + ' Sound(s) loaded.')

        if (config.usewebserver) require("./webserver.js").run(bot, loadedSounds, playFile) //Webserver is enabled? Run it.
    })

    //Addons reader
    fs.readdir('./Addons/', (err, files) => {
        if (err) console.error(err);

        var jsfiles = files.filter(f => f.split('.').pop() === 'js');
        jsfiles.splice(jsfiles.indexOf("blank.js"), 1) //remove blank command

        jsfiles.forEach((f, i) => {
            if (f == "blank.js") return; //skip blank command

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

    function autoJoin(callback) {
        if (message.member.voice.channel == null) { //Check if the user is in a voice channel
            message.channel.send("Please join a voice channel first!")
            return; 
        }

        if(!bot.guilds.cache.get(message.guild.id).voice || bot.guilds.cache.get(message.guild.id).me.voice.channel.id == null) {
            var connection = DiscordVoice.joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            })

            callback(connection); //return new connection with callback

        } else {
            return callback(message.member.guild.me.voice.connection) //return existing connection with callback
        }
    }


    switch(args[0].toLowerCase()) {
        case 'ping':
            message.channel.send('Pong.');
            break;

        case 'stop':
            if (bot.guilds.cache.get(message.guild.id).me.voice.channel && bot.guilds.cache.get(message.guild.id).me.voice.channel.id !== null) {
                message.guild.me.voice.disconnect();
            };

            console.log('Shutting down...');

            message.channel.send('Goodbye!').then(m => {
                bot.destroy();
                process.exit(1);
            });
            break;

        /* case 'restart':
            message.channel.send('Restarting...');
            client.destroy();
            setTimeout(() => {
                loadLogin();
            }, 1000);
            then(console.log('Bot restarted.')) 
            break; */

        case 'help':
            message.channel.send(`Bot-Commands:\n` +
                `\`${config.prefix}ping\`\n` +
                `\`${config.prefix}stop\`\n` +
                `\`${config.prefix}join\`\n` +
                `\`${config.prefix}leave\`\n` +
                `\`${config.prefix}sound\` (Type sound for more help)\n` +
                `\`${config.prefix}restart\` (This Command doesn't load new Content)`)
            break;

        case 'join':
            if (args[1]) {
                var requestedchannel = message.guild.channels.cache.find(channel => channel.name == args.slice(1).join(" "))

                if (requestedchannel != undefined && requestedchannel.type == "GUILD_VOICE") {
                    try {
                        DiscordVoice.joinVoiceChannel({
                            channelId: requestedchannel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator
                        })
                    } catch (err) {
                        message.channel.send("An error occurred trying to join the voice channel: " + err)
                        console.log("An error occurred trying to join the voice channel: " + err)
                    }
                } else {
                    return message.channel.send("The requested channel could either not be found or isn't a voice channel.")
                }
            } else {
                var requestedchannel = message.member.voice.channel

                if (requestedchannel == null) return message.channel.send('Please join a Channel first!');

                try {
                    DiscordVoice.joinVoiceChannel({
                        channelId: requestedchannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    })
                } catch (err) {
                    message.channel.send("An error occurred trying to join the voice channel: " + err)
                    console.log("An error occurred trying to join the voice channel: " + err)
                }
            }

            console.log(`Joined ${requestedchannel.name} (${requestedchannel.id}).`)
            message.channel.send("Joined `" + requestedchannel.name + "`.")
            break;

        case 'leave':
            if (!bot.guilds.cache.get(message.guild.id).me.voice || bot.guilds.cache.get(message.guild.id).me.voice.channel == null) return message.channel.send('I am not connected to any voice channel!\nIf I am still in a voice channel please wait or disconnect me manually.')

            console.log(`Left ${message.guild.me.voice.channel.name}.`)
            message.channel.send("Left `" + message.guild.me.voice.channel.name + "`.")

            message.guild.me.voice.disconnect();
            break;

        case 'sound':
            if (args[1] === 'add') {
                var dest = "./Sounds/" + [...message.attachments.values()][0]["name"];

                if (loadedSounds.includes([...message.attachments.values()][0]["name"].replace(".mp3", ""))) return message.channel.send('Sound does already exist.');

                https.get([...message.attachments.values()][0]["attachment"], function(response) {
                    response.pipe(fs.createWriteStream(dest));

                    fs.createWriteStream(dest).on('finish', function() {
                        console.log("File download completed.") 
                    });
                }).on('error', function(err) { 
                    console.log("An error occurred downloading the file: " + err) 
                }) 

                message.channel.send('Adding Sound to the Board'); 
                loadedSounds.push([...message.attachments.values()][0]["name"].replace(".mp3", ""));

            } else if(args[1] === 'delete') {
                if (!fs.existsSync("./Sounds/" + args[2] + '.mp3')) return message.channel.send('Sound doesn´t exist.');

                fs.unlinkSync("./Sounds/" + args[2] + '.mp3');
                loadedSounds.splice(loadedSounds.indexOf(args[2]), 1);
                message.channel.send('Sound has been deleted.');

            } else if(args[1] === 'list') {
                if (loadedSounds.length == 0) message.channel.send("No sounds found!")
                    else message.channel.send(loadedSounds.join("\n"));

            } else if(args[1] === 'dplay') {
                if (message.member.voice.channel == null) { //Check if the user is in a voice channel
                    message.channel.send("Please join a voice channel first!")
                    return;
                } 

                autoJoin((connection) => {
                    try {
                        connection.subscribe(player);
                  
                        const resource = DiscordVoice.createAudioResource([...message.attachments.values()][0]["attachment"], {
                            inputType: DiscordVoice.StreamType.Arbitrary
                        });
                  
                        player.play(resource);

                    } catch (err) {
                        console.log("Error trying to play sound: " + err);
                        message.channel.send("Error trying to play sound: " + err);
                        return;
                    }
                })

                message.channel.send('Playing Sound...')
                return;

            } else if(args[1] === 'play') {
                if (message.member.voice.channel == null) { //Check if the user is in a voice channel
                    message.channel.send("Please join a voice channel first!")
                    return; 
                }
                
                autoJoin((connection) => {
                    try {
                        connection.subscribe(player);
                  
                        const resource = DiscordVoice.createAudioResource('./Sounds/'+ args.slice(2).join(" ") +'.mp3', {
                            inputType: DiscordVoice.StreamType.Arbitrary
                        });
                  
                        player.play(resource);

                    } catch (err) {
                        console.log("Error trying to play sound: " + err);
                        message.channel.send("Error trying to play sound: " + err);
                        return;
                    }
                })

                message.channel.send('Playing Sound: ' + args.slice(2).join(" "))

            } else {
                message.channel.send('Please use //sound [play/delete/list] [title], \nsend a mp3 with the Comment "//sound dplay" or \nadd a Sound to the Folder')
            }

            break;

        case "eval":
            if (!config.owners.includes(message.author.id)) return message.channel.send("You have no permission to use this command.");

            const clean = text => {
                if (typeof(text) === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                    else return text; 
            }

            try {
                args.shift() //remove command name
                const code = args.join(" ");
                let evaled = eval(code);

                if (typeof evaled !== "string")
                evaled = require("util").inspect(evaled);

                message.channel.send(clean(evaled), {code:"xl"}).catch(err => {
                    message.channel.send("Error: " + err) 
                })
            } catch (err) {
                message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
                message.react("❌")
                return; 
            }

            message.react("✅")
            break;

        default:
            var addon = bot.addons.get(args[0].toLowerCase())

            if (addon) { 
                addon.run(bot, message, args);
                return;
            }
            break;
    }
});

module.exports={
    playFile
}

loadLogin();