const config = require('../config');
const EmbedUtils = require('../utils/embedBuilder');
const levelSystem = require('../services/levelSystem');
const moderationLogs = require('../services/moderationLogs');

// Message cache for spam detection
const messageCache = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // Ignore bot messages
        if (message.author.bot) return;
        
        // Process XP for the message
        await levelSystem.processMessage(message);
        
        // Spam detection
        const key = `${message.author.id}-${message.channelId}`;
        const userMessages = messageCache.get(key) || [];
        const now = Date.now();
        
        // Clean old messages outside the window
        const recentMessages = userMessages.filter(timestamp => now - timestamp < config.spamInterval);
        recentMessages.push(now);
        messageCache.set(key, recentMessages);
        
        // Check for spam
        if (recentMessages.length >= config.spamThreshold) {
            try {
                // Timeout the user
                await message.member.timeout(config.defaultTimeoutDuration, 'Automatic timeout: Spam detection');
                
                // Send warning
                const warningEmbed = EmbedUtils.warning('Spam Detection', 
                    `${message.author} has been timed out for spamming.`);
                
                await message.channel.send({ embeds: [warningEmbed] });
                
                // Log the action
                await moderationLogs.log(message.guild, {
                    type: 'timeout',
                    target: message.author,
                    moderator: client.user,
                    reason: 'Automatic timeout: Spam detection',
                    duration: config.defaultTimeoutDuration
                });
                
                // Clear cache for this user
                messageCache.delete(key);
            } catch (error) {
                console.error('Error applying timeout:', error);
            }
        }
        
        // Filter bad words
        const content = message.content.toLowerCase();
        if (config.badWords.some(word => content.includes(word))) {
            try {
                await message.delete();
                
                // Send warning
                const warningEmbed = EmbedUtils.warning('Message Deleted', 
                    `${message.author}, please keep the chat clean!`);
                    
                const warning = await message.channel.send({ embeds: [warningEmbed] });
                
                // Delete warning after 5 seconds
                setTimeout(() => warning.delete().catch(() => {}), 5000);
                
                // Log the action
                await moderationLogs.log(message.guild, {
                    type: 'messageDelete',
                    target: message.author,
                    moderator: client.user,
                    reason: 'Automatic deletion: Inappropriate content',
                    content: message.content
                });
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
        
        // Handle prefix commands if desired (alongside slash commands)
        if (message.content.startsWith(config.prefix)) {
            // TODO: implement prefix command handling
        }
    }
};