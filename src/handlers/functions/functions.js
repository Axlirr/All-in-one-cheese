const Discord = require('discord.js');
const fetch = require("node-fetch");

const Functions = require("../../database/models/functions");
const VoiceSchema = require("../../database/models/voiceChannels");
const ModeratorPerformance = require("../../database/models/moderatorPerformance");

module.exports = async (client) => {
    //----------------------------------------------------------------//
    //                         Permissions                            //
    //----------------------------------------------------------------//
    // All bitfields to name
    client.bitfieldToName = function (bitfield) {
        const permissions = new Discord.PermissionsBitField(bitfield);
        return permissions.toArray();
    }
    client.checkPerms = async function ({
        flags: flags,
        perms: perms
    }, interaction) {
        for (let i = 0; i < flags.length; i++) {
            if (!interaction.member.permissions.has(flags[i])) {
                client.errMissingPerms({
                    perms: client.bitfieldToName(flags[i]) || flags[i],
                    type: 'editreply'
                }, interaction);

                return false
            }
            if (!interaction.guild.members.me.permissions.has(flags[i])) {
                client.errNoPerms({
                    perms: client.bitfieldToName(flags[i]) || flags[i],
                    type: 'editreply'
                }, interaction);

                return false
            }
        }
    }
    client.checkBotPerms = async function ({
        flags: flags,
        perms: perms
    }, interaction) {
        for (let i = 0; i < flags.length; i++) {
             if (!interaction.guild.members.me.permissions.has(flags[i])) {
                client.errNoPerms({
                    perms: client.bitfieldToName(flags[i]) || flags[i],
                    type: 'editreply'
                }, interaction);

                return false
            }
        }
    }
    client.checkUserPerms = async function ({
        flags: flags,
        perms: perms
    }, interaction) {
        for (let i = 0; i < flags.length; i++) {
            if (!interaction.member.permissions.has(flags[i])) {
                client.errMissingPerms({
                    perms: client.bitfieldToName(flags[i]) || flags[i],
                    type: 'editreply'
                }, interaction);

                return false
            }
        }
    }

    client.getChannel = function (channel, message) {
        return message.mentions.channels.first() || message.guild.channels.cache.get(channel) || message.guild.channels.cache.find(c => c.name == channel);
    }

    client.removeMentions = function (str) {
        return str.replaceAll('@', '@\u200b');
    }

    client.loadSubcommands = async function (client, interaction, args) {
        const fs = require('fs');
        const path = require('path');

        const commandName = interaction.commandName;
        const subcommand = interaction.options.getSubcommand();

        const commandFolder = commandName;
        const baseDir = path.join(process.cwd(), 'src', 'commands', commandFolder);

        let isBeta = false;
        try {
            const data = await Functions.findOne({ Guild: interaction.guild.id });
            isBeta = Boolean(data && data.Beta === true);
        } catch (_) {
            isBeta = false;
        }

        const candidates = [
            path.join(baseDir, `${subcommand}${isBeta ? '-beta' : ''}.js`),
            path.join(baseDir, `${subcommand}.js`),
        ];

        const commandPath = candidates.find((p) => fs.existsSync(p));

        if (!commandPath) {
            return client.errNormal({
                error: `This subcommand is not available yet: /${commandName} ${subcommand}`,
                type: 'editreply'
            }, interaction);
        }

        try {
            return require(commandPath)(client, interaction, args).catch(err => {
                client.emit('errorCreate', err, `${commandName}:${subcommand}`, interaction)
            });
        } catch (err) {
            client.emit('errorCreate', err, `${commandName}:${subcommand}`, interaction);
            return client.errNormal({
                error: 'An error occurred while loading this command.',
                type: 'editreply'
            }, interaction);
        }
    }

    client.checkVoice = async function (guild, channel) {
        const data = await VoiceSchema.findOne({ Guild: guild.id, Channel: channel.id });
        if (data) {
            return true;
        }
        else {
            return false;
        }
    }

    client.generateEmbed = async function (start, end, lb, title, interaction) {
        const current = lb.slice(start, end + 10);
        const result = current.join("\n");

        let embed = client.templateEmbed()
            .setTitle(`${title}`)
            .setDescription(`${result.toString()}`)

        const functiondata = await Functions.findOne({ Guild: interaction.guild.id });

        if (functiondata && functiondata.Color) {
            embed.setColor(functiondata.Color)
        }

        return embed;
    }

    client.createLeaderboard = async function (title, lb, interaction) {
        interaction.editReply({ embeds: [await client.generateEmbed(0, 0, lb, title, interaction)] }).then(async msg => {
            if (lb.length <= 10) return;

            let button1 = new Discord.ButtonBuilder()
                .setCustomId('back_button')
                .setEmoji('⬅️')
                .setStyle(Discord.ButtonStyle.Primary)
                .setDisabled(true);

            let button2 = new Discord.ButtonBuilder()
                .setCustomId('forward_button')
                .setEmoji('➡️')
                .setStyle(Discord.ButtonStyle.Primary);

            let row = new Discord.ActionRowBuilder()
                .addComponents(button1, button2);

            msg.edit({ embeds: [await client.generateEmbed(0, 0, lb, title, interaction)], components: [row] })

            let currentIndex = 0;
            const collector = interaction.channel.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: 60000 });

            collector.on('collect', async (btn) => {
                if (btn.user.id == interaction.user.id && btn.message.id == msg.id) {
                    btn.customId === "back_button" ? currentIndex -= 10 : currentIndex += 10;

                    let btn1 = new Discord.ButtonBuilder()
                        .setCustomId('back_button')
                        .setEmoji('⬅️')
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setDisabled(true);

                    let btn2 = new Discord.ButtonBuilder()
                        .setCustomId('forward_button')
                        .setEmoji('➡️')
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setDisabled(true);

                    if (currentIndex !== 0) btn1.setDisabled(false);
                    if (currentIndex + 10 < lb.length) btn2.setDisabled(false);

                    let row2 = new Discord.ActionRowBuilder()
                        .addComponents(btn1, btn2);

                    msg.edit({ embeds: [await client.generateEmbed(currentIndex, currentIndex, lb, title, interaction)], components: [row2] });
                    btn.deferUpdate();
                }
            })

            collector.on('end', async (btn) => {
                let btn1Disable = new Discord.ButtonBuilder()
                    .setCustomId('back_button')
                    .setEmoji('⬅️')
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(true);

                let btn2Disable = new Discord.ButtonBuilder()
                    .setCustomId('forward_button')
                    .setEmoji('➡️')
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(true);

                let rowDisable = new Discord.ActionRowBuilder()
                    .addComponents(btn1Disable, btn2Disable);

                msg.edit({ embeds: [await client.generateEmbed(currentIndex, currentIndex, lb, title, interaction)], components: [rowDisable] });
            })
        })
    }

    client.trackModeratorAction = async function ({ guildId, moderatorId, actionType, responseMs = 0, success = true }) {
        if (!guildId || !moderatorId || !actionType) return;

        const doc = await ModeratorPerformance.findOne({ Guild: guildId, Moderator: moderatorId }) || new ModeratorPerformance({
            Guild: guildId,
            Moderator: moderatorId,
            ActionsByType: {}
        });

        doc.TotalActions += 1;
        if (success) doc.SuccessfulActions += 1;
        else doc.FailedActions += 1;

        const safeResponse = Math.max(0, Number(responseMs) || 0);
        doc.TotalResponseMs += safeResponse;
        doc.AvgResponseMs = Math.round(doc.TotalResponseMs / Math.max(doc.TotalActions, 1));
        doc.LastActionAt = Date.now();

        if (!doc.ActionsByType) doc.ActionsByType = {};
        doc.ActionsByType[actionType] = (doc.ActionsByType[actionType] || 0) + 1;

        await doc.save();
    }

    client.rateModerator = async function ({ guildId, moderatorId, byUserId, score, note = '' }) {
        if (!guildId || !moderatorId || !byUserId) return null;

        const doc = await ModeratorPerformance.findOne({ Guild: guildId, Moderator: moderatorId }) || new ModeratorPerformance({
            Guild: guildId,
            Moderator: moderatorId,
            ActionsByType: {}
        });

        const safeScore = Math.max(1, Math.min(5, Number(score) || 1));
        doc.Ratings.push({
            By: byUserId,
            Score: safeScore,
            Note: String(note || '').slice(0, 300),
            Date: Date.now(),
        });

        doc.RatingCount += 1;
        doc.RatingTotal += safeScore;
        doc.RatingAvg = Number((doc.RatingTotal / Math.max(doc.RatingCount, 1)).toFixed(2));

        await doc.save();
        return doc;
    }

    client.generateActivity = function (id, name, channel, interaction) {
        fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
            method: "POST",
            body: JSON.stringify({
                max_age: 86400,
                max_uses: 0,
                target_application_id: id,
                target_type: 2,
                temporary: false,
                validate: null
            }),
            headers: {
                "Authorization": `Bot ${client.token}`,
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
            .then(invite => {
                if (invite.error || !invite.code) return client.errNormal({ 
                    error: `Could not start **${name}**!`, 
                    type: 'editreply'
                }, interaction);

                const row = new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setLabel("Start activity")
                            .setURL(`https://discord.gg/${invite.code}`)
                            .setStyle(Discord.ButtonStyle.Link),
                    );

                client.embed({
                    title: `${client.emotes.normal.tv}・Activities`,
                    desc: `Click on the **button** to start **${name}** in **${channel.name}**`,
                    components: [row],
                    type: 'editreply'
                }, interaction)
            })
            .catch(e => {
                console.log(e)
                client.errNormal({
                    error: `Could not start **${name}**!`,
                    type: 'editreply'
                }, interaction);
            })
    }
}

 