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

    const image = await Canvas.greyscale(userAvatar)
    let attach = new Discord.AttachmentBuilder(image, { name: "greyscale.png" });

    const embed = client.templateEmbed();
    embed.setImage("attachment://greyscale.png");
    interaction.editReply({ files: [attach], embeds: [embed] })
}

