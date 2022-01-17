const config = require("../config.json");
module.exports.run = async (bot, message, args) => {
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
}