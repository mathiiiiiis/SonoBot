const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`${user.tag}'s Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'User ID', value: user.id, inline: true },
                { name: 'Created On', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: 'Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : 'Not in server', inline: true }
            );

        if (member) {
            const roles = member.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(role => role.toString());

            embed.addFields(
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Roles', value: roles.length ? roles.join(', ') : 'None' }
            );

            if (member.premiumSince) {
                embed.addFields({
                    name: 'Boosting Since',
                    value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`,
                    inline: true
                });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
}; 