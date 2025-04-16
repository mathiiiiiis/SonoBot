const { EmbedBuilder } = require('discord.js');
const config = require('../config');

class ModerationLogs {
    constructor() {
        // Store logs temporarily - in a production bot, use a database
        this.logs = [];
    }
    
    /**
     * Log a moderation action
     * @param {Object} guild - Discord guild
     * @param {Object} action - Action details
     * @returns {Promise<void>}
     */
    async log(guild, action) {
        try {
            // Store log
            this.logs.push({
                id: this.logs.length + 1,
                guildId: guild.id,
                timestamp: new Date(),
                ...action
            });
            
            // Find mod log channel
            const logChannel = guild.channels.cache.find(
                ch => ch.name === config.modLogChannelName
            );
            
            if (!logChannel) return;
            
            // Create appropriate embed based on action type
            let embed;
            
            switch (action.type) {
                case 'ban':
                    embed = new EmbedBuilder()
                        .setTitle('🔨 Member Banned')
                        .setColor('#ED4245') // Discord Red
                        .setDescription(`**User:** ${action.target.tag} (${action.target.id})
**Moderator:** ${action.moderator.tag}
**Reason:** ${action.reason || 'No reason provided'}`)
                        .setTimestamp();
                    break;
                    
                case 'kick':
                    embed = new EmbedBuilder()
                        .setTitle('👢 Member Kicked')
                        .setColor('#FEE75C') // Discord Yellow
                        .setDescription(`**User:** ${action.target.tag} (${action.target.id})
**Moderator:** ${action.moderator.tag}
**Reason:** ${action.reason || 'No reason provided'}`)
                        .setTimestamp();
                    break;
                    
                case 'timeout':
                    embed = new EmbedBuilder()
                        .setTitle('⏰ Member Timed Out')
                        .setColor('#5865F2') // Discord Blurple
                        .setDescription(`**User:** ${action.target.tag} (${action.target.id})
**Moderator:** ${action.moderator.tag}
**Duration:** ${action.duration / 1000 / 60} minutes
**Reason:** ${action.reason || 'No reason provided'}`)
                        .setTimestamp();
                    break;
                    
                case 'warn':
                    embed = new EmbedBuilder()
                        .setTitle('⚠️ Member Warned')
                        .setColor('#FEE75C') // Discord Yellow
                        .setDescription(`**User:** ${action.target.tag} (${action.target.id})
**Moderator:** ${action.moderator.tag}
**Reason:** ${action.reason || 'No reason provided'}`)
                        .setTimestamp();
                    break;
                    
                case 'messageDelete':
                    embed = new EmbedBuilder()
                        .setTitle('🗑️ Message Deleted')
                        .setColor('#5865F2') // Discord Blurple
                        .setDescription(`**User:** ${action.target.tag} (${action.target.id})
**Moderator:** ${action.moderator.tag}
**Reason:** ${action.reason || 'No reason provided'}
**Content:** \`\`\`${action.content || 'No content available'}\`\`\``)
                        .setTimestamp();
                    break;
                    
                default:
                    embed = new EmbedBuilder()
                        .setTitle('🛡️ Moderation Action')
                        .setColor('#5865F2') // Discord Blurple
                        .setDescription(`**Type:** ${action.type}
**User:** ${action.target.tag} (${action.target.id})
**Moderator:** ${action.moderator.tag}
**Reason:** ${action.reason || 'No reason provided'}`)
                        .setTimestamp();
            }
            
            // Add case number
            embed.setFooter({ 
                text: `Case #${this.logs.length}`, 
                iconURL: guild.iconURL() 
            });
            
            // Send log
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error creating moderation log:', error);
        }
    }
    
    /**
     * Get logs for a specific user
     * @param {string} guildId - Guild ID
     * @param {string} userId - User ID
     * @returns {Array} - User logs
     */
    getUserLogs(guildId, userId) {
        return this.logs.filter(log => 
            log.guildId === guildId && 
            log.target.id === userId
        );
    }
}

module.exports = new ModerationLogs();