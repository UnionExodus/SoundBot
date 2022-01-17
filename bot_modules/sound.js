const https = require("https");
const fs = require("fs");
const Discord = require("discord.js");
const DiscordVoice = require("@discordjs/voice");
const player    = DiscordVoice.createAudioPlayer();

/**
 * Handle if bot is not in voice channel
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {function} [callback] Called with ´connection´ (VoiceConnection) on completion or ´null´ on failure
 */
function autoJoin(bot, message, callback) {
    if (message.member.voice.channel == null) { //Check if the user is in a voice channel
        message.channel.send("Please join a voice channel first!")
        callback(null);
        return;
    }

    if(!bot.guilds.cache.get(message.guild.id).me.voice || bot.guilds.cache.get(message.guild.id).me.voice.channel.id == null) {
        var connection = DiscordVoice.joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        })
        callback(connection); //return new connection with callback
    } else {
        callback(message.member.guild.me.voice.connection); //return existing connection with callback
    }
}

/**
 * Check for Argument for the "sound" command
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {Array} args Array of user's message word by word
 */
module.exports.run = async (bot, message, args) => {
    if (!args[1]) message.channel.send('Please use //sound [play/delete/list] [title], \nsend a mp3 with the Comment "//sound dplay" or \nadd a Sound to the Folder');
}


/**
 * Play sound
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {Array} args Array of user's message word by word
 */
module.exports.play = (bot, message, args) => {
    if (message.member.voice.channel == null) { //Check if the user is in a voice channel
        message.channel.send("Please join a voice channel first!")
        return;
    }

    autoJoin(bot, message, (connection) => {
        try {
            connection.subscribe(player);

            const resource = DiscordVoice.createAudioResource('./Sounds/' + args.slice(2).join(" ") + '.mp3', {
                inputType: DiscordVoice.StreamType.Arbitrary
            });

            player.play(resource);
            message.channel.send('Playing Sound: ' + args.slice(2).join(" "))

        } catch (err) {
            console.log("Error trying to play sound: " + err);
            message.channel.send("Error trying to play sound: " + err);
            return;
        }
    })
}


/**
 * Add sound
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {Array} args Array of user's message word by word
 */
module.exports.add = (bot, message, args) => {
    if ([...message.attachments.values()].length <= 0) return message.channel.send('No Sound detected.');
    var dest = "./Sounds/" + [...message.attachments.values()][0]["name"];

    if (bot.loadedSounds.includes([...message.attachments.values()][0]["name"].replace(".mp3", ""))) return message.channel.send('Sound does already exist.');

    https.get([...message.attachments.values()][0]["attachment"], function(response) {
        response.pipe(fs.createWriteStream(dest));

        fs.createWriteStream(dest).on('finish', function() {
            console.log("File download completed.")
        });
    }).on('error', function(err) {
        console.log("An error occurred downloading the file: " + err)
    })

    message.channel.send('Adding Sound to the Board');
    bot.loadedSounds.push([...message.attachments.values()][0]["name"].replace(".mp3", ""));
}


/**
 * Delete sound
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {Array} args Array of user's message word by word
 */
module.exports.delete = (bot, message, args) => {
    if (!fs.existsSync("./Sounds/" + args[2] + '.mp3')) return message.channel.send('Sound doesn´t exist.');

    fs.unlinkSync("./Sounds/" + args[2] + '.mp3');
    bot.loadedSounds.splice(bot.loadedSounds.indexOf(args[2]), 1);
    message.channel.send('Sound has been deleted.');
}


/**
 * Directly play sound
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {Array} args Array of user's message word by word
 */
module.exports.dplay = (bot, message, args) => {
    if ([...message.attachments.values()].length <= 0) return message.channel.send('No Sound detected.');
    if (message.member.voice.channel == null) { //Check if the user is in a voice channel
        message.channel.send("Please join a voice channel first!")
        return;
    }

    autoJoin(bot, message, (connection) => {
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
}


/**
 * List sound
 * @param {Discord.Client} bot The discord client class
 * @param {Discord.Message} message the user's full message
 * @param {Array} args Array of user's message word by word
 */
module.exports.list = (bot, message, args) => {
    if (bot.loadedSounds.length == 0) message.channel.send("No sounds found!")
        else message.channel.send(bot.loadedSounds.join("\n"));
}