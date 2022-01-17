const DiscordVoice = require("@discordjs/voice");
module.exports.run = async (bot, message, args) => {
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
}