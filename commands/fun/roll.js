const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll a die')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the die (default: 6)')
                .setMinValue(2)
                .setMaxValue(100)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of dice to roll (default: 1)')
                .setMinValue(1)
                .setMaxValue(25)
                .setRequired(false)),

    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const amount = interaction.options.getInteger('amount') || 1;

        const rolls = Array.from({ length: amount }, () => Math.floor(Math.random() * sides) + 1);
        const total = rolls.reduce((a, b) => a + b, 0);

        let response = `🎲 Rolling ${amount} d${sides}...\n`;
        if (amount > 1) {
            response += `Results: ${rolls.join(', ')}\n`;
            response += `Total: ${total}`;
        } else {
            response += `Result: ${rolls[0]}`;
        }

        await interaction.reply(response);
    },
}; 