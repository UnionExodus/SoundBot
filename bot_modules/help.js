const commandsFile = require("./commands.json")
const {MessageEmbed, MessageActionRow, MessageSelectMenu} = require('discord.js')
const Discord = require('discord.js')

module.exports.run = async (bot, message, args) => {

/*
     const helpEmbed = new MessageEmbed()
        .setColor('#006400')
        .setTitle('Help')
        .setAuthor({name: 'UnionExodus & 3urobeat', iconURL:'https://images.t3n.de/news/wp-content/uploads/2021/10/NFT-Poop.jpg?class=hero-small', url: 'https://3urobeat.com'})
        .setDescription('SoundBot help interface')
        .setThumbnail('https://cdn.pixabay.com/photo/2020/05/11/15/38/tom-5158824_960_720.png')
        .setFooter({text: 'UnionExodus', iconURL: 'https://cdn.pixabay.com/photo/2021/06/29/18/55/mountain-slope-6374980_960_720.jpg'})


    Object.keys(commandsFile).forEach((e) => {

        helpEmbed.addField(commandsFile[e].alias[0], commandsFile[e].description)

        if (commandsFile[e].subcommands) {

            Object.keys(commandsFile[e].subcommands).forEach((f) => {

                helpEmbed.addField(commandsFile[e].subcommands[f].alias[0], commandsFile[e].subcommands[f].description, true)

            })

        }
*/

    const { MessageActionRow, MessageEmbed, MessageSelectMenu } = require('discord.js');


    bot.on('createInteraction', async interaction => {

        const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('select')
                        .setPlaceholder('Nothing selected')
                        .addOptions([
                            {
                                label: 'basic commands',
                                description: 'This is a description',
                                value: 'first_option',
                            },
                            {
                                label: 'soundboard',
                                description: 'This is also a description',
                                value: 'second_option',
                            },
                        ]),
                );

            const embed = new MessageEmbed()
                .setColor('#006400')
                .setTitle('Help')
                .setAuthor({
                    name: 'UnionExodus & 3urobeat',
                    iconURL: 'https://images.t3n.de/news/wp-content/uploads/2021/10/NFT-Poop.jpg?class=hero-small',
                    url: 'https://3urobeat.com'
                })
                .setDescription('SoundBot help interface')
                .setThumbnail('https://cdn.pixabay.com/photo/2020/05/11/15/38/tom-5158824_960_720.png')
                .setFooter({
                    text: 'UnionExodus',
                    iconURL: 'https://cdn.pixabay.com/photo/2021/06/29/18/55/mountain-slope-6374980_960_720.jpg'
                })

            await interaction.reply({content: 'test', ephermeral: false, embeds: [embed], components: [row]});


        if (!interaction.isSelectMenu()) return;
        if (interaction.customId === 'select') {
            await interaction.deferUpdate();
            await wait(4000);
            await interaction.editReply({ content: 'Something was selected!', components: [] });
        }


    });















   // })

    //message.channel.send({ embeds: [helpEmbed]});

}