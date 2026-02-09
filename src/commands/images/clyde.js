const Discord = require("discord.js");
const { Canvas, checkCanvasAvailable } = require("../../utils/canvasHelper");

module.exports = async (client, interaction, args) => {
    if (checkCanvasAvailable(client, interaction)) return;

    const clydeMessage = interaction.options.getString('text');

    const image = await Canvas.clyde(clydeMessage)

    const attachment = new Discord.AttachmentBuilder(image, "clyde.png");

    const embed = client.templateEmbed().setImage("attachment://clyde.png");
    interaction.editReply({ files: [attachment], embeds: [embed] });
}

 