const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await fetch('https://meme-api.com/gimme');
            const data = await response.json();

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(data.title)
                .setURL(data.postLink)
                .setImage(data.url)
                .setFooter({ text: `👍 ${data.ups} | Subreddit: r/${data.subreddit}` });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching meme:', error);
            await interaction.editReply('Sorry, I couldn\'t fetch a meme right now. Try again later!');
        }
    },
}; 