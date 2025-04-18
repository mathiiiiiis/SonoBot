const EmbedUtils = require('../utils/embedBuilder');
const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            if (!command) {
                return interaction.reply({
                    embeds: [EmbedUtils.error('Unknown Command', 'This command does not exist.')],
                    flags: { ephemeral: true }
                });
            }
            
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing command "${interaction.commandName}":`, error);
                
                // Handle permission errors differently
                if (error.message.includes('Missing Permissions')) {
                    return interaction.reply({
                        embeds: [EmbedUtils.error('Permission Error', 'I lack the necessary permissions to perform this action.')],
                        flags: { ephemeral: true }
                    });
                }
                
                // Generic error handling
                const errorReply = {
                    embeds: [EmbedUtils.error('Command Error', 'There was an error executing this command.')],
                    flags: { ephemeral: true }
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorReply);
                } else {
                    await interaction.reply(errorReply);
                }
            }
        }
        
        // Handle other interaction types (buttons, select menus, etc.) if needed
        else if (interaction.isButton()) {
            // Button handling logic could go here
            const [action, ...params] = interaction.customId.split(':');
            
            // Example of handling reaction role buttons
            if (action === 'role') {
                const roleId = params[0];
                try {
                    const role = interaction.guild.roles.cache.get(roleId);
                    
                    if (!role) {
                        return interaction.reply({
                            embeds: [EmbedUtils.error('Role Error', 'This role no longer exists.')],
                            flags: { ephemeral: true }
                        });
                    }
                    
                    const member = interaction.member;
                    
                    if (member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId);
                        return interaction.reply({
                            embeds: [EmbedUtils.success('Role Removed', `The ${role.name} role has been removed.`)],
                            flags: { ephemeral: true }
                        });
                    } else {
                        await member.roles.add(roleId);
                        return interaction.reply({
                            embeds: [EmbedUtils.success('Role Added', `The ${role.name} role has been added.`)],
                            flags: { ephemeral: true }
                        });
                    }
                } catch (error) {
                    console.error('Error handling role button:', error);
                    return interaction.reply({
                        embeds: [EmbedUtils.error('Role Error', 'There was an error handling your role request.')],
                        flags: { ephemeral: true }
                    });
                }
            }
        }
        
        else if (interaction.isSelectMenu()) {
            // Select menu handling logic
        }
    }
};