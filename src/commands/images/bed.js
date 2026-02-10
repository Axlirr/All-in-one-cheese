const Discord = require('discord.js');
const { Canvas, checkCanvasAvailable } = require("../../utils/canvasHelper");

module.exports = async (client, interaction, args) => {
    if (checkCanvasAvailable(client, interaction)) return;

    const member = interaction.options.getUser('user');

    const userAvatar = member.displayAvatarURL({ dynamic: false, size: 1024, extension: 'png' });

    const img = await Canvas.bed(interaction.user.avatarURL({ size: 1024, extension: 'png' }), userAvatar);

    let attach = new Discord.AttachmentBuilder(img, { name: "bed.png" });
    const embed = client.templateEmbed().setImage("attachment://bed.png");
    interaction.editReply({ files: [attach], embeds: [embed] });
}

