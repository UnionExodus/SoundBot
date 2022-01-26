module.exports.run = async (bot, message, args) => {
    if (bot.guilds.cache.get(message.guild.id).me.voice.channel && bot.guilds.cache.get(message.guild.id).me.voice.channel.id !== null) {
        message.guild.me.voice.disconnect();
    };

    console.log('Shutting down...');

    message.channel.send('Goodbye!').then(m => {
        bot.destroy();
        process.exit(1);
    });
}