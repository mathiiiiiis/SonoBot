const { EmbedBuilder } = require('discord.js');
const config = require('../config');

class EmbedUtils {
    /**
     * Creates a standardized success embed
     * @param {string} title - Embed title
     * @param {string} description - Embed description
     * @returns {EmbedBuilder} - Discord embed
     */
    static success(title, description) {
        return new EmbedBuilder()
            .setTitle(`✅ ${title}`)
            .setColor(config.colors.success)
            .setDescription(description)
            .setTimestamp();
    }
    
    /**
     * Creates a standardized error embed
     * @param {string} title - Embed title
     * @param {string} description - Embed description
     * @returns {EmbedBuilder} - Discord embed
     */
    static error(title, description) {
        return new EmbedBuilder()
            .setTitle(`❌ ${title}`)
            .setColor(config.colors.error)
            .setDescription(description)
            .setTimestamp();
    }
    
    /**
     * Creates a standardized warning embed
     * @param {string} title - Embed title
     * @param {string} description - Embed description
     * @returns {EmbedBuilder} - Discord embed
     */
    static warning(title, description) {
        return new EmbedBuilder()
            .setTitle(`⚠️ ${title}`)
            .setColor(config.colors.warning)
            .setDescription(description)
            .setTimestamp();
    }
    
    /**
     * Creates a standardized info embed
     * @param {string} title - Embed title
     * @param {string} description - Embed description
     * @returns {EmbedBuilder} - Discord embed
     */
    static info(title, description) {
        return new EmbedBuilder()
            .setTitle(`ℹ️ ${title}`)
            .setColor(config.colors.info)
            .setDescription(description)
            .setTimestamp();
    }
    
    /**
     * Creates a custom embed with the primary color
     * @returns {EmbedBuilder} - Discord embed
     */
    static custom() {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTimestamp();
    }
}

module.exports = EmbedUtils;