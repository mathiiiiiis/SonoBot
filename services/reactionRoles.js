const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');

class ReactionRoles {
    constructor() {
        // Store role menus - in a production bot, use a database
        this.menus = new Map();
    }
    
    /**
     * Create a new reaction role menu
     * @param {Object} channel - Discord channel
     * @param {string} title - Menu title
     * @param {string} description - Menu description
     * @param {Array} roles - Array of role objects with id, name, emoji, and description
     * @returns {Promise<Object>} - Created menu
     */
    async createMenu(channel, title, description, roles) {
        try {
            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(config.colors.primary)
                .setFooter({ text: 'Click a button to receive the role' });
            
            // Create buttons (up to 5 per row)
            const rows = [];
            let currentRow = new ActionRowBuilder();
            let buttonCount = 0;
            
            for (const role of roles) {
                // Create button
                const button = new ButtonBuilder()
                    .setCustomId(`role:${role.id}`)
                    .setLabel(role.name)
                    .setStyle(ButtonStyle.Secondary);
                    
                // Add emoji if provided
                if (role.emoji) {
                    button.setEmoji(role.emoji);
                }
                
                // Add button to current row
                currentRow.addComponents(button);
                buttonCount++;
                
                // Create new row if needed
                if (buttonCount % 5 === 0) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder();
                }
                
                // Add role description to embed if provided
                if (role.description) {
                    embed.addFields({
                        name: `${role.emoji || ''} ${role.name}`,
                        value: role.description
                    });
                }
            }
            
            // Add final row if it has buttons
            if (currentRow.components.length > 0) {
                rows.push(currentRow);
            }
            
            // Send menu
            const message = await channel.send({
                embeds: [embed],
                components: rows
            });
            
            // Store menu
            const menuId = message.id;
            this.menus.set(menuId, {
                id: menuId,
                guildId: channel.guild.id,
                channelId: channel.id,
                roles: roles.map(r => r.id)
            });
            
            return { id: menuId, message };
        } catch (error) {
            console.error('Error creating reaction role menu:', error);
            throw error;
        }
    }
    
    /**
     * Delete a reaction role menu
     * @param {string} menuId - Menu ID
     * @returns {Promise<boolean>} - Success status
     */
    async deleteMenu(menuId) {
        try {
            const menu = this.menus.get(menuId);
            
            if (!menu) {
                return false;
            }
            
            // Delete message
            const guild = client.guilds.cache.get(menu.guildId);
            if (guild) {
                const channel = guild.channels.cache.get(menu.channelId);
                if (channel) {
                    try {
                        const message = await channel.messages.fetch(menuId);
                        await message.delete();
                    } catch (e) {
                        // Message might not exist anymore, that's ok
                    }
                }
            }
            
            // Remove from storage
            this.menus.delete(menuId);
            return true;
        } catch (error) {
            console.error('Error deleting reaction role menu:', error);
            return false;
        }
    }
    
    /**
     * Check if a button interaction is for a reaction role
     * @param {Object} interaction - Button interaction
     * @returns {boolean} - Whether this is a reaction role button
     */
    isReactionRoleButton(interaction) {
        return interaction.isButton() && 
               interaction.customId.startsWith('role:');
    }
    
    /**
     * Handle a button interaction for reaction roles
     * @param {Object} interaction - Button interaction
     * @returns {Promise<void>}
     */
    async handleButtonInteraction(interaction) {
        if (!this.isReactionRoleButton(interaction)) return;
        
        try {
            const roleId = interaction.customId.split(':')[1];
            const member = interaction.member;
            const role = interaction.guild.roles.cache.get(roleId);
            
            if (!role) {
                return interaction.reply({
                    content: 'That role no longer exists!',
                    ephemeral: true
                });
            }
            
            // Toggle role
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(roleId);
                await interaction.reply({
                    content: `Removed the ${role.name} role!`,
                    ephemeral: true
                });
            } else {
                await member.roles.add(roleId);
                await interaction.reply({
                    content: `Added the ${role.name} role!`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Error handling reaction role button:', error);
            await interaction.reply({
                content: 'There was an error processing your role request.',
                ephemeral: true
            });
        }
    }
}

module.exports = new ReactionRoles();