const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const moderationLogs = require('../../services/moderationLogs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user for a specified duration')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Timeout duration (e.g., 1h, 1d, 1w)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const durationStr = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Parse duration
            const duration = parseDuration(durationStr);
            if (!duration) {
                return interaction.reply({
                    content: 'Invalid duration format. Use format like: 1h, 1d, 1w',
                    ephemeral: true
                });
            }

            // Check if user is moderatable
            const member = interaction.guild.members.cache.get(user.id);
            if (!member) {
                return interaction.reply({
                    content: 'This user is not in the server.',
                    ephemeral: true
                });
            }

            if (!member.moderatable) {
                return interaction.reply({
                    content: 'I cannot timeout this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            // Timeout the user
            await member.timeout(duration, `${reason} | Timed out by ${interaction.user.tag}`);

            // Log the timeout
            await moderationLogs.logModeration({
                guildId: interaction.guild.id,
                action: 'timeout',
                targetId: user.id,
                moderatorId: interaction.user.id,
                reason: reason,
                duration: duration
            });

            await interaction.reply({
                content: `Successfully timed out ${user.tag} for ${durationStr} | Reason: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in timeout command:', error);
            await interaction.reply({
                content: 'There was an error executing this command.',
                ephemeral: true
            });
        }
    },
};

function parseDuration(duration) {
    const match = duration.match(/^(\d+)([hdw])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    const num = parseInt(amount);

    switch (unit) {
        case 'h': return num * 60 * 60 * 1000; // hours to milliseconds
        case 'd': return num * 24 * 60 * 60 * 1000; // days to milliseconds
        case 'w': return num * 7 * 24 * 60 * 60 * 1000; // weeks to milliseconds
        default: return null;
    }
} 