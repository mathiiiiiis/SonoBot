require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_BOT_TOKEN,
    prefix: process.env.PREFIX || '!',
    
    // Moderation settings
    spamThreshold: parseInt(process.env.SPAM_THRESHOLD) || 5,
    spamInterval: parseInt(process.env.SPAM_INTERVAL) || 5000,
    defaultTimeoutDuration: parseInt(process.env.DEFAULT_TIMEOUT_DURATION) || 300000,
    
    // Guild settings
    welcomeChannelName: process.env.WELCOME_CHANNEL || '1361426316133666946',
    modLogChannelName: process.env.MOD_LOG_CHANNEL || '1361432529764094113',
    defaultMemberRole: process.env.DEFAULT_MEMBER_ROLE || '1361426311196835880',
    
    // Custom embed colors
    colors: {
        primary: '#5865F2',   // Discord Blurple
        success: '#57F287',   // Discord Green
        warning: '#FEE75C',   // Discord Yellow
        error: '#ED4245',     // Discord Red
        info: '#5865F2'       // Discord Blurple
    },
    
    // Filter settings
    badWords: [
        'nigger', 'bastard', 'hurensohn', 'wixxer', 'xxx', 
        'pornhub.org', 'https://pornhub.org', 'porn', 
        'kill yourself'
    ],
    
    // Level system settings
    xpSettings: {
        baseXp: 5,           // Base XP per message
        randomVariance: 10,  // Random XP between 0-10 added
        cooldown: 60000,     // One minute cooldown between XP gains
    }
};