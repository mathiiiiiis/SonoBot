const canvasUtils = require('../utils/canvasUtils');
const config = require('../config');
const EmbedUtils = require('../utils/embedBuilder');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        try {
            // Find welcome channel
            const welcomeChannel = member.guild.channels.cache.find(
                ch => ch.name === config.welcomeChannelName
            );
            
            if (welcomeChannel) {
                // Create welcome image
                const welcomeAttachment = await canvasUtils.createWelcomeImage(member);
                
                // Create welcome embed
                const welcomeEmbed = EmbedUtils.custom()
                    .setTitle(`Welcome to ${member.guild.name}!`)
                    .setDescription(`Hey ${member}, we're glad you're here! 
                    
Welcome to SODO
                    
📜 Please check out our RULES to get started!
💬 Introduce yourself in INTRODUCTION!`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setImage('attachment://welcome.png')
                    .setFooter({ text: `Member #${member.guild.memberCount}` });
                
                // Send welcome message
                await welcomeChannel.send({ 
                    embeds: [welcomeEmbed],
                    files: [welcomeAttachment]
                });
            }
            
            // Auto-assign default role if configured
            if (config.defaultMemberRole) {
                try {
                    const role = member.guild.roles.cache.get(config.defaultMemberRole);
                    if (role) {
                        await member.roles.add(role);
                        console.log(`Assigned default role to ${member.user.tag}`);
                    }
                } catch (roleError) {
                    console.error('Error assigning role:', roleError);
                }
            }
            
            // Send welcome DM
            try {
                const dmEmbed = EmbedUtils.custom()
                    .setTitle(`Welcome to ${member.guild.name}!`)
                    .setDescription(`Hey ${member.user.username}, thanks for joining!
                    
Here's a quick guide to get you started:
- Check out the https://discord.com/channels/1361423614066426046/1361426321175216371 channel
- Introduce yourself in https://discord.com/channels/1361423614066426046/1361426349881037133
- Set your roles in https://discord.com/channels/1361423614066426046/1362891409233018992

If you have any questions, feel free to ask a moderator or admin!`)
                    .setThumbnail(member.guild.iconURL({ dynamic: true }));
                
                await member.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                // User might have DMs closed - this is fine, just log it
                console.log(`Could not send welcome DM to ${member.user.tag}`);
            }
        } catch (error) {
            console.error('Error in guildMemberAdd event:', error);
        }
    }
};