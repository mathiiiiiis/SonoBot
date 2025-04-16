const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a number of messages from the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addNumberOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)),

    async execute(interaction) {
        const amount = interaction.options.getNumber('amount');

        try {
            // Delete messages
            const deleted = await interaction.channel.bulkDelete(amount, true);

            // Send confirmation
            await interaction.reply({
                content: `Successfully deleted ${deleted.size} messages.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in clear command:', error);
            await interaction.reply({
                content: 'There was an error deleting messages. Messages older than 14 days cannot be bulk deleted.',
                ephemeral: true
            });
        }
    },
}; 