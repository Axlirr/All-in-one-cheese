const Discord = require('discord.js');

const store = require('../../database/models/economyStore');
const sellable = require('../../database/models/economySellable');

module.exports = async (client, interaction) => {
    const perms = await client.checkUserPerms({
        flags: [Discord.PermissionsBitField.Flags.ManageMessages],
        perms: [Discord.PermissionsBitField.Flags.ManageMessages]
    }, interaction);

    if (perms === false) return;

    const type = interaction.options.getString('type');
    const role = interaction.options.getRole('role');
    const key = interaction.options.getString('key');

    if (type === 'role') {
        if (!role) {
            return client.errNormal({ error: 'Role type requires the role option.', type: 'editreply' }, interaction);
        }

        const storeData = await store.findOne({ Guild: interaction.guild.id, Role: role.id });
        const sellableData = await sellable.findOne({ Guild: interaction.guild.id, Key: `role_${role.id}` });

        if (!storeData && !sellableData) {
            return client.errNormal({ error: 'This role is not in the store.', type: 'editreply' }, interaction);
        }

        await store.deleteOne({ Guild: interaction.guild.id, Role: role.id });
        await sellable.deleteOne({ Guild: interaction.guild.id, Key: `role_${role.id}` });

        return client.succNormal({
            text: 'The role was deleted from the store.',
            fields: [{ name: '🛒┆Role', value: `${role}` }],
            type: 'editreply'
        }, interaction);
    }

    if (!key) {
        return client.errNormal({ error: 'Custom type requires the key option.', type: 'editreply' }, interaction);
    }

    const deleted = await sellable.deleteOne({ Guild: interaction.guild.id, Key: key.trim() });
    if (!deleted.deletedCount) {
        return client.errNormal({ error: 'No custom item found with that key.', type: 'editreply' }, interaction);
    }

    return client.succNormal({
        text: 'Custom store item deleted.',
        fields: [{ name: '🆔┆Key', value: key.trim() }],
        type: 'editreply'
    }, interaction);
};

 