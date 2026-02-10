const Discord = require('discord.js');
const { Canvas, checkCanvasAvailable } = require("../../utils/canvasHelper");

module.exports = async (client, interaction, args) => {
    if (checkCanvasAvailable(client, interaction)) return;

    const member = interaction.options.getUser('user');

    const userAvatar = member.displayAvatarURL({ dynamic: false, size: 1024, extension: 'png' });

    const lvl = 4

    const img = await Canvas.blur(userAvatar, lvl)

    let attach = new Discord.AttachmentBuilder(img, { name: "blurred.png" });
    const embed = client.templateEmbed().setImage("attachment://blurred.png");
    interaction.editReply({ files: [attach], embeds: [embed] });
}

