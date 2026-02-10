const Discord = require('discord.js');
const { Canvas, checkCanvasAvailable } = require("../../utils/canvasHelper");

module.exports = async (client, interaction, args) => {
    if (checkCanvasAvailable(client, interaction)) return;

    const member = interaction.options.getUser('user');

    const userAvatar = member.displayAvatarURL({ dynamic: false, size: 1024, extension: 'png' });

    const image = await Canvas.greyscale(userAvatar)
    let attach = new Discord.AttachmentBuilder(image, { name: "greyscale.png" });

    const embed = client.templateEmbed();
    embed.setImage("attachment://greyscale.png");
    interaction.editReply({ files: [attach], embeds: [embed] })
}

