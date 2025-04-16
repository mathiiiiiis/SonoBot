const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const moderationLogs = require('../../services/moderationLogs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addNumberOption(option =>
            option.setName('days')
                .setDescription('Number of days of messages to delete')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const days = interaction.options.getNumber('days') || 0;

        try {
            // Check if user is bannable
            const member = interaction.guild.members.cache.get(user.id);
            if (member && !member.bannable) {
                return interaction.reply({
                    content: 'I cannot ban this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            // Ban the user
            await interaction.guild.members.ban(user, {
                deleteMessageDays: days,
                reason: `${reason} | Banned by ${interaction.user.tag}`
            });

            // Log the ban
            await moderationLogs.logModeration({
                guildId: interaction.guild.id,
                action: 'ban',
                targetId: user.id,
                moderatorId: interaction.user.id,
                reason: reason,
                duration: null
            });

            await interaction.reply({
                content: `Successfully banned ${user.tag} | Reason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in ban command:', error);
            await interaction.reply({
                content: 'There was an error executing this command.',
                ephemeral: true
            });
        }
    },
}; 