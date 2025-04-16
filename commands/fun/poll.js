const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Poll options (separated by commas)')
                .setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const options = interaction.options.getString('options').split(',').map(opt => opt.trim());

        if (options.length < 2 || options.length > 10) {
            return interaction.reply({
                content: 'Please provide between 2 and 10 options for the poll.',
                ephemeral: true
            });
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const pollText = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');

        const message = await interaction.reply({
            content: `**${question}**\n\n${pollText}`,
            fetchReply: true
        });

        // Add reactions
        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
}; 