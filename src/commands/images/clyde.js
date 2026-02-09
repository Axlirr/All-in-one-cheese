const Discord = require("discord.js");

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

    const clydeMessage = interaction.options.getString('text');

    const image = await Canvas.clyde(clydeMessage)

    const attachment = new Discord.AttachmentBuilder(image, "clyde.png");

    const embed = client.templateEmbed().setImage("attachment://clyde.png");
    interaction.editReply({ files: [attachment], embeds: [embed] });
}

 