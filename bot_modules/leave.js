module.exports.run = async (bot, message, args) => {
    if (!bot.guilds.cache.get(message.guild.id).me.voice || bot.guilds.cache.get(message.guild.id).me.voice.channel == null) return message.channel.send('I am not connected to any voice channel!\nIf I am still in a voice channel please wait or disconnect me manually.')

    console.log(`Left ${message.guild.me.voice.channel.name}.`)
    message.channel.send("Left `" + message.guild.me.voice.channel.name + "`.")

    message.guild.me.voice.disconnect();
}