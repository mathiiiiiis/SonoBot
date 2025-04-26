// Main entry point for the Discord bot
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv').config();
const config = require('./config');
const eventHandler = require('./handlers/eventHandler');
const commandHandler = require('./handlers/commandHandler');
const axios = require('axios');

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

// Function to ping the status endpoint
async function pingStatusEndpoint() {
    try {
        const response = await axios.get(process.env.STATUS_ENDPOINT_URL);
        console.log('Status ping sent successfully:', response.status);
    } catch (error) {
        console.error('Failed to ping status endpoint:', error.message);
    }
}

// Load events and commands
(async () => {
    // Initialize handlers
    await eventHandler.init(client);
    await commandHandler.init(client);
    
    // Login the bot with token
    client.login(config.token);
    
    // Set up the status ping interval (20 seconds = 20000 milliseconds)
    setInterval(pingStatusEndpoint, 20000);
    
    // Initial ping when bot starts
    pingStatusEndpoint();
})();

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});