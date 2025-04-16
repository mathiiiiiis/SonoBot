const { SlashCommandBuilder } = require('@discordjs/builders');
const EmbedUtils = require('../../utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    
    async execute(interaction, client) {
        // Initial response
        await interaction.deferReply();
        
        // Calculate message latency
        const sent = await interaction.fetchReply();
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        // Create embed
        const pingEmbed = EmbedUtils.custom()
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Message Latency', value: `${latency}ms`, inline: true },
                { name: 'WebSocket Latency', value: `${client.ws.ping}ms`, inline: true }
            );
        
        await interaction.editReply({ embeds: [pingEmbed] });
    }
};