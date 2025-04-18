const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const reactionRoles = require('../../services/reactionRoles');
const EmbedUtils = require('../../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionroles')
        .setDescription('Manage reaction role menus')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new reaction role menu')
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Title for the reaction role menu')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for the reaction role menu')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role1')
                        .setDescription('First role to add')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji1')
                        .setDescription('Emoji for the first role')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('role2')
                        .setDescription('Second role to add')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('emoji2')
                        .setDescription('Emoji for the second role')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('role3')
                        .setDescription('Third role to add')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('emoji3')
                        .setDescription('Emoji for the third role')
                        .setRequired(false))
                .addRoleOption(option =>
                    option.setName('role4')
                        .setDescription('Fourth role to add')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit an existing reaction role menu')
                .addStringOption(option =>
                    option.setName('messageid')
                        .setDescription('The message ID of the menu to edit')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('New title for the menu')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('New description for the menu')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('roles')
                        .setDescription('JSON array of roles with id, name, emoji, and description')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('addrole')
                .setDescription('Add a role to an existing menu')
                .addStringOption(option =>
                    option.setName('messageid')
                        .setDescription('The message ID of the menu')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to add')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Emoji for the role')
                        .setRequired(false))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Description for the role')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removerole')
                .setDescription('Remove a role from a menu')
                .addStringOption(option =>
                    option.setName('messageid')
                        .setDescription('The message ID of the menu')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to remove')
                        .setRequired(true))),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create': {
                    const title = interaction.options.getString('title');
                    const description = interaction.options.getString('description');
                    const roles = [];

                    // Only add roles that are actually provided
                    for (let i = 1; i <= 4; i++) {
                        const role = interaction.options.getRole(`role${i}`);
                        const emoji = interaction.options.getString(`emoji${i}`);
                        
                        if (role) {
                            roles.push({
                                id: role.id,
                                name: role.name,
                                emoji: emoji || '',
                                description: ''
                            });
                        }
                    }

                    if (roles.length === 0) {
                        return interaction.reply({
                            content: 'You must provide at least one role.',
                            flags: { ephemeral: true }
                        });
                    }

                    await reactionRoles.createMenu(
                        interaction.guild.channels.cache.get(interaction.channelId),
                        title,
                        description,
                        roles
                    );

                    await interaction.reply({
                        content: 'Successfully created the reaction role menu!',
                        flags: { ephemeral: true }
                    });
                    break;
                }

                case 'edit': {
                    const messageId = interaction.options.getString('messageid');
                    const menu = reactionRoles.menus.get(messageId);

                    if (!menu) {
                        return interaction.reply({
                            content: 'Could not find that reaction role menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    const title = interaction.options.getString('title');
                    const description = interaction.options.getString('description');
                    const rolesJson = interaction.options.getString('roles');

                    let roles;
                    if (rolesJson) {
                        try {
                            roles = JSON.parse(rolesJson);
                            if (!Array.isArray(roles)) throw new Error('Roles must be an array');
                        } catch (error) {
                            return interaction.reply({
                                content: 'Invalid roles format. Please provide a valid JSON array.',
                                flags: { ephemeral: true }
                            });
                        }
                    }

                    // Get the channel and message
                    const channel = interaction.guild.channels.cache.get(menu.channelId);
                    if (!channel) {
                        return interaction.reply({
                            content: 'Could not find the channel for this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    let message;
                    try {
                        message = await channel.messages.fetch(messageId);
                    } catch (error) {
                        return interaction.reply({
                            content: 'Could not find the message for this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    // Create new menu with updated content
                    const newRoles = roles || menu.roles.map(roleId => {
                        const role = interaction.guild.roles.cache.get(roleId);
                        if (!role) return null;
                        return {
                            id: roleId,
                            name: role.name,
                            emoji: '',
                            description: ''
                        };
                    }).filter(role => role !== null);

                    // Delete old message first
                    try {
                        await message.delete();
                    } catch (error) {
                        console.error('Error deleting message:', error);
                    }

                    // Create new menu
                    await reactionRoles.createMenu(
                        channel,
                        title || (message.embeds[0] ? message.embeds[0].title : 'Reaction Roles'),
                        description || (message.embeds[0] ? message.embeds[0].description : 'Select a role below'),
                        newRoles
                    );

                    await interaction.reply({
                        content: 'Successfully updated the reaction role menu!',
                        flags: { ephemeral: true }
                    });
                    break;
                }

                case 'addrole': {
                    const messageId = interaction.options.getString('messageid');
                    const role = interaction.options.getRole('role');
                    const emoji = interaction.options.getString('emoji');
                    const description = interaction.options.getString('description');

                    const menu = reactionRoles.menus.get(messageId);
                    if (!menu) {
                        return interaction.reply({
                            content: 'Could not find that reaction role menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    // Get the channel and message
                    const channel = interaction.guild.channels.cache.get(menu.channelId);
                    if (!channel) {
                        return interaction.reply({
                            content: 'Could not find the channel for this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    let message;
                    try {
                        message = await channel.messages.fetch(messageId);
                    } catch (error) {
                        return interaction.reply({
                            content: 'Could not find the message for this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    // Add new role to existing roles
                    const existingRoles = menu.roles.map(roleId => {
                        const existingRole = interaction.guild.roles.cache.get(roleId);
                        if (!existingRole) return null;
                        return {
                            id: roleId,
                            name: existingRole.name,
                            emoji: '',
                            description: ''
                        };
                    }).filter(role => role !== null);

                    existingRoles.push({
                        id: role.id,
                        name: role.name,
                        emoji: emoji || '',
                        description: description || ''
                    });

                    // Delete old message first
                    try {
                        await message.delete();
                    } catch (error) {
                        console.error('Error deleting message:', error);
                    }

                    // Create new menu
                    await reactionRoles.createMenu(
                        channel,
                        message.embeds[0] ? message.embeds[0].title : 'Reaction Roles',
                        message.embeds[0] ? message.embeds[0].description : 'Select a role below',
                        existingRoles
                    );

                    await interaction.reply({
                        content: `Successfully added the ${role.name} role to the menu!`,
                        flags: { ephemeral: true }
                    });
                    break;
                }

                case 'removerole': {
                    const messageId = interaction.options.getString('messageid');
                    const role = interaction.options.getRole('role');

                    const menu = reactionRoles.menus.get(messageId);
                    if (!menu) {
                        return interaction.reply({
                            content: 'Could not find that reaction role menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    if (!menu.roles.includes(role.id)) {
                        return interaction.reply({
                            content: 'That role is not in this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    // Get the channel and message
                    const channel = interaction.guild.channels.cache.get(menu.channelId);
                    if (!channel) {
                        return interaction.reply({
                            content: 'Could not find the channel for this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    let message;
                    try {
                        message = await channel.messages.fetch(messageId);
                    } catch (error) {
                        return interaction.reply({
                            content: 'Could not find the message for this menu.',
                            flags: { ephemeral: true }
                        });
                    }

                    // Remove role from existing roles
                    const existingRoles = menu.roles
                        .filter(roleId => roleId !== role.id)
                        .map(roleId => {
                            const existingRole = interaction.guild.roles.cache.get(roleId);
                            if (!existingRole) return null;
                            return {
                                id: roleId,
                                name: existingRole.name,
                                emoji: '',
                                description: ''
                            };
                        }).filter(role => role !== null);

                    // Delete old message first
                    try {
                        await message.delete();
                    } catch (error) {
                        console.error('Error deleting message:', error);
                    }

                    // Create new menu
                    await reactionRoles.createMenu(
                        channel,
                        message.embeds[0] ? message.embeds[0].title : 'Reaction Roles',
                        message.embeds[0] ? message.embeds[0].description : 'Select a role below',
                        existingRoles
                    );

                    await interaction.reply({
                        content: `Successfully removed the ${role.name} role from the menu!`,
                        flags: { ephemeral: true }
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Error in reaction roles command:', error);
            await interaction.reply({
                content: 'There was an error executing this command.',
                flags: { ephemeral: true }
            });
        }
    },
};