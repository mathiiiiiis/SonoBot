const fs = require('fs').promises;
const path = require('path');

module.exports = {
    async init(client) {
        const eventFiles = await fs.readdir(path.join(__dirname, '../events'))
            .then(files => files.filter(file => file.endsWith('.js')));
        
        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            const eventName = file.split('.')[0];
            
            if (event.once) {
                client.once(eventName, (...args) => event.execute(...args, client));
            } else {
                client.on(eventName, (...args) => event.execute(...args, client));
            }
        }
        
        console.log(`Loaded ${eventFiles.length} events.`);
    }
};