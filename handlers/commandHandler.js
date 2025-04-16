const fs = require('fs').promises;
const path = require('path');
const { Collection } = require('discord.js');

module.exports = {
    async init(client) {
        // Create commands collection on client
        client.commands = new Collection();
        client.commandArray = [];

        const commandFolders = await fs.readdir(path.join(__dirname, '../commands'));
        
        for (const folder of commandFolders) {
            const commandFiles = await fs.readdir(path.join(__dirname, `../commands/${folder}`))
                .then(files => files.filter(file => file.endsWith('.js')));
            
            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                
                // Set command in collection
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                    client.commandArray.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] Command at ${folder}/${file} is missing required properties.`);
                }
            }
        }
        
        console.log(`Loaded ${client.commands.size} commands.`);
    }
};