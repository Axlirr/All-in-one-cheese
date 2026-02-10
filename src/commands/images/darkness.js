const Discord = require('discord.js');
const { Canvas, checkCanvasAvailable } = require("../../utils/canvasHelper");

module.exports = async (client, interaction, args) => {
    if (checkCanvasAvailable(client, interaction)) return;

    const member = interaction.options.getUser('user');

    const userAvatar = member.displayAvatarURL({ dynamic: false, size: 1024, extension: 'png' });

    const amount = 60

    const image = await Canvas.darkness(userAvatar, amount);
    let attach = new Discord.AttachmentBuilder(image, { name: "darkness.gif" });

    const embed = client.templateEmbed().setImage("attachment://darkness.gif");
    interaction.editReply({ files: [attach], embeds: [embed] });    
}

