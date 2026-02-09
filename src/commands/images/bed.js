const Discord = require('discord.js');

module.exports = async (client, interaction, args) => {
    let Canvas;
    try {
        Canvas = require("canvacord").Canvas;
    } catch (error) {
        return client.errNormal({
            error: "This command requires canvas packages that are not available in this environment.",
            type: 'editreply'
        }, interaction);
    }

    const member = interaction.options.getUser('user');

    const userAvatar = member.displayAvatarURL({ dynamic: false, size: 1024, extension: 'png' });

    const img = await Canvas.bed(interaction.user.avatarURL({ size: 1024, extension: 'png' }), userAvatar);

    let attach = new Discord.AttachmentBuilder(img, { name: "bed.png" });
    const embed = client.templateEmbed().setImage("attachment://bed.png");
    interaction.editReply({ files: [attach], embeds: [embed] });
}

