// Main entry point for the Discord bot
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./config');
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');

// Create client with all necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Load events and commands
(async () => {
    // Initialize handlers
    await eventHandler.init(client);
    await commandHandler.init(client);
    
    // Login the bot with token
    client.login(config.token);
})();

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});