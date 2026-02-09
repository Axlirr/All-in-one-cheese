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

    const lvl = 4

    const img = await Canvas.blur(userAvatar, lvl)

    let attach = new Discord.AttachmentBuilder(img, { name: "blurred.png" });
    const embed = client.templateEmbed().setImage("attachment://blurred.png");
    interaction.editReply({ files: [attach], embeds: [embed] });
}

