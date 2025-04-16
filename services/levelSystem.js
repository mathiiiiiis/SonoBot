const { EmbedBuilder } = require('discord.js');
const config = require('../config');

class LevelSystem {
    constructor() {
        // In-memory cache of user XP
        // In a production bot, this should use a database
        this.userXP = new Map();
        this.cooldowns = new Map();
        
        // XP required for each level
        this.levelThresholds = Array(100).fill(0).map((_, i) => {
            return Math.floor(100 * Math.pow(1.5, i));
        });
    }
    
    /**
     * Calculate level based on XP
     * @param {number} xp - User's XP
     * @returns {number} - User's level
     */
    calculateLevel(xp) {
        let level = 0;
        while (level < this.levelThresholds.length && xp >= this.levelThresholds[level]) {
            level++;
        }
        return level;
    }
    
    /**
     * Get user XP data
     * @param {string} guildId - Guild ID
     * @param {string} userId - User ID
     * @returns {Object} - User XP data
     */
    getUserData(guildId, userId) {
        const key = `${guildId}-${userId}`;
        if (!this.userXP.has(key)) {
            this.userXP.set(key, { xp: 0, level: 0, messages: 0 });
        }
        return this.userXP.get(key);
    }
    
    /**
     * Add XP to a user
     * @param {string} guildId - Guild ID
     * @param {string} userId - User ID
     * @param {number} amount - Amount of XP to add
     * @returns {Object} - Updated user data and whether they leveled up
     */
    addXP(guildId, userId, amount) {
        const userData = this.getUserData(guildId, userId);
        const oldLevel = userData.level;
        
        userData.xp += amount;
        userData.messages += 1;
        userData.level = this.calculateLevel(userData.xp);
        
        const leveledUp = userData.level > oldLevel;
        
        return { userData, leveledUp };
    }
    
    /**
     * Process a message for XP
     * @param {Object} message - Discord message
     * @returns {Promise<void>}
     */
    async processMessage(message) {
        const { author, guild } = message;
        
        // Skip if DM
        if (!guild) return;
        
        const userId = author.id;
        const guildId = guild.id;
        const key = `${guildId}-${userId}`;
        
        // Check cooldown
        const now = Date.now();
        const cooldownTime = this.cooldowns.get(key) || 0;
        
        if (now - cooldownTime < config.xpSettings.cooldown) {
            return;
        }
        
        // Reset cooldown
        this.cooldowns.set(key, now);
        
        // Calculate random XP to award
        const xpToAdd = config.xpSettings.baseXp + 
            Math.floor(Math.random() * config.xpSettings.randomVariance);
        
        // Add XP
        const { userData, leveledUp } = this.addXP(guildId, userId, xpToAdd);
        
        // Handle level up
        if (leveledUp) {
            try {
                const levelUpEmbed = new EmbedBuilder()
                    .setTitle('🎉 Level Up!')
                    .setDescription(`Congratulations ${author}! You've reached level **${userData.level}**!`)
                    .setColor(config.colors.primary)
                    .setThumbnail(author.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Current XP', value: `${userData.xp} XP`, inline: true },
                        { name: 'Next Level', value: `${this.levelThresholds[userData.level]} XP`, inline: true }
                    )
                    .setFooter({ text: `Keep chatting to earn more XP!` });
                
                // Can customize where to send level up messages (current channel, DM, or dedicated channel)
                await message.channel.send({ embeds: [levelUpEmbed] });
                
                // Award role rewards if configured
                // TODO: implement this feature
            } catch (error) {
                console.error('Error sending level up message:', error);
            }
        }
    }
    
    /**
     * Get leaderboard data for a guild
     * @param {string} guildId - Guild ID
     * @param {number} limit - Number of users to include
     * @returns {Array} - Sorted leaderboard data
     */
    getLeaderboard(guildId, limit = 10) {
        const guildData = [];
        
        // Filter and collect data for this guild
        for (const [key, data] of this.userXP.entries()) {
            if (key.startsWith(`${guildId}-`)) {
                const userId = key.split('-')[1];
                guildData.push({ userId, ...data });
            }
        }
        
        // Sort by XP (descending)
        return guildData
            .sort((a, b) => b.xp - a.xp)
            .slice(0, limit);
    }
}

module.exports = new LevelSystem();