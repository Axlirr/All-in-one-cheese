const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const Discord = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('Adjust the bot to your taste')
        .addSubcommand(subcommand =>
            subcommand
                .setName('help')
                .setDescription('Get information about the config category commands')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('levels')
                .setDescription('Enable/disable levels')
                .addBooleanOption(option => option.setName('boolean').setDescription('Select a boolean').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setcolor')
                .setDescription('Set a custom embed color')
                .addStringOption(option => option.setName("color").setDescription("Enter a hex color").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setverify')
                .setDescription('Setup the verify panel')
                .addBooleanOption(option => option.setName('enable').setDescription('Select a boolean').setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('Select a channel').setRequired(true).addChannelTypes(ChannelType.GuildText))
                .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setchannelname')
                .setDescription('Set a custom channel name for server stats')
                .addStringOption(option => option.setName("name").setDescription("Enter a name for the channel or send HELP for the args").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('levelmessage')
                .setDescription('Set the bot level message')
                .addStringOption(option => option.setName("message").setDescription("Enter a message for the levels or send HELP for the args").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('welcomemessage')
                .setDescription('Set the welcome message')
                .addStringOption(option => option.setName("message").setDescription("Enter a welcome message or send HELP for the args").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leavemessage')
                .setDescription('Set the leave message')
                .addStringOption(option => option.setName("message").setDescription("Enter a leave message or send HELP for the args").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticketmessage')
                .setDescription('Set the ticket message of the bot')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Ticket message type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'open', value: 'open' },
                            { name: 'closeDM', value: 'close' }
                        )
                )
                .addStringOption(option => option.setName("message").setDescription("Enter a message for the ticket").setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('setnewschannel')
                .setDescription('Set channel and source variant for automated world news posting')
                .addChannelOption(option => option.setName('channel').setDescription('Text channel for automated news').setRequired(true).addChannelTypes(ChannelType.GuildText))
                .addStringOption(option => option.setName('variant').setDescription('News source style').setRequired(true).addChoices(
                    { name: 'world', value: 'world' },
                    { name: 'tech', value: 'tech' },
                    { name: 'finance', value: 'finance' },
                    { name: 'happy', value: 'happy' }
                ))
                .addNumberOption(option => option.setName('interval').setDescription('Fetch interval in minutes (5-120)').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('newsstatus')
                .setDescription('Show current automated news posting settings')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disablenews')
                .setDescription('Disable automated world news posting for this server')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('postnewsnow')
                .setDescription('Fetch and post news instantly for testing')
        )
    ,

    /** 
     * @param {Client} client
     * @param {CommandInteraction} interaction
     * @param {String[]} args
     */

    run: async (client, interaction, args) => {
        await interaction.deferReply({ fetchReply: true });
        client.loadSubcommands(client, interaction, args);
    },
};

 