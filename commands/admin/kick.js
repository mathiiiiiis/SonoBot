const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const moderationLogs = require('../../services/moderationLogs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Check if user is kickable
            const member = interaction.guild.members.cache.get(user.id);
            if (!member) {
                return interaction.reply({
                    content: 'This user is not in the server.',
                    ephemeral: true
                });
            }

            if (!member.kickable) {
                return interaction.reply({
                    content: 'I cannot kick this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            // Kick the user
            await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

            // Log the kick
            await moderationLogs.log(interaction.guild, {
                type: 'kick',
                target: user,
                moderator: interaction.user,
                reason: reason
            });

            await interaction.reply({
                content: `Successfully kicked ${user.tag} | Reason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in kick command:', error);
            await interaction.reply({
                content: 'There was an error executing this command.',
                ephemeral: true
            });
        }
    },
}; 