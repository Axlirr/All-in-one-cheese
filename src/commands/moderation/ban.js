const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
  const perms = await client.checkPerms({
    flags: [Discord.PermissionsBitField.Flags.BanMembers],
    perms: [Discord.PermissionsBitField.Flags.BanMembers]
  }, interaction)

  if (perms == false) return;

  const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id);
  const reason = interaction.options.getString('reason') || 'Not given';

  if (member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers) || member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) return client.errNormal({
    error: "You can't ban a moderator",
    type: 'editreply'
  }, interaction);

  client.embed({
    title: `🔨・Ban`,
    desc: `You've been banned in **${interaction.guild.name}**`,
    fields: [
      {
        name: "👤┆Banned by",
        value: interaction.user.tag,
        inline: true
      },
      {
        name: "💬┆Reason",
        value: reason,
        inline: true
      }
    ]
  }, member).then(function () {
    member.ban({ reason: reason })
    client.succNormal({
      text: "User banned and notified via DM.",
      fields: [
        {
          name: "👤┆Banned user",
          value: member.user.tag,
          inline: true
        },
        {
          name: "💬┆Reason",
          value: reason,
          inline: true
        }
      ],
      type: 'editreply'
    }, interaction);
  }).catch(function () {
    member.ban({ reason: reason })
    client.succNormal({
      text: "User banned. No DM notification was sent.",
      type: 'editreply'
    }, interaction);
  });
}

 