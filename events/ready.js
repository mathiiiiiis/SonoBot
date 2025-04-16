const { REST, Routes } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
        
        try {
            // Set status
            client.user.setActivity('with Discord.js', { type: 3 });
            
            // Register commands with Discord API
            console.log('Started refreshing application (/) commands.');
            
            const rest = new REST({ version: '10' }).setToken(config.token);
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: client.commandArray }
            );
            
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }
};