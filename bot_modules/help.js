module.exports.run = async (message, args, commands) => {
    switch(args[1].toLowerCase()) { //toLowerCase??
        case '':
            message.channel.send(commands.values);
            break;
        case 'join':
            message.channel.send(commands.join);
    }
}