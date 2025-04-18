const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const levelSystem = require('../../services/levelSystem');
const Canvas = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Display your level information or another user\'s')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to check level for')
                .setRequired(false)),
    
    async execute(interaction, client) {
        await interaction.deferReply();
        
        // Get target user (mentioned or self)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = await interaction.guild.members.fetch(targetUser.id);
        
        // Get user data
        const userData = levelSystem.getUserData(interaction.guildId, targetUser.id);
        const nextLevelXP = levelSystem.levelThresholds[userData.level];
        const currentLevelXP = userData.level > 0 ? levelSystem.levelThresholds[userData.level - 1] : 0;
        const progressXP = userData.xp - currentLevelXP;
        const requiredXP = nextLevelXP - currentLevelXP;
        const progressPercent = (progressXP / requiredXP) * 100;
        
        // Generate level card using Canvas
        const canvas = Canvas.createCanvas(800, 250);
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#36393f'; // Discord dark gray
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add decorative accent
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, '#5865F2');
        gradient.addColorStop(1, '#5865F233');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, 6);
        
        // User avatar
        try {
            const avatar = await Canvas.loadImage(targetUser.displayAvatarURL({ 
                extension: 'png', 
                size: 256,
                forceStatic: true
            }));
            
            // Create circular avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(125, 125, 80, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 45, 45, 160, 160);
            ctx.restore();
            
            // Avatar border
            ctx.strokeStyle = config.colors.primary;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(125, 125, 84, 0, Math.PI * 2);
            ctx.stroke();
        } catch (error) {
            console.error('Error loading avatar:', error);
        }
        
        // User name and discriminator
        ctx.font = 'bold 36px Whitney';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(targetUser.username, 250, 80);
        
        // Level and Rank
        ctx.font = 'bold 28px Whitney';
        ctx.fillStyle = '#5865F2';
        ctx.fillText(`Level: ${userData.level}`, 250, 130);
        
        // Progress to next level
        ctx.font = '22px Whitney';
        ctx.fillStyle = '#B9BBBE';
        ctx.fillText(`XP: ${progressXP} / ${requiredXP}`, 250, 170);
        
        // XP progress bar background
        ctx.fillStyle = '#2f3136'; 
        const barX = 250;
        const barY = 190;
        const barWidth = 500;
        const barHeight = 30;
        
        // Rounded rectangle for background
        ctx.beginPath();
        ctx.moveTo(barX + barHeight/2, barY);
        ctx.lineTo(barX + barWidth - barHeight/2, barY);
        ctx.arc(barX + barWidth - barHeight/2, barY + barHeight/2, barHeight/2, -Math.PI/2, Math.PI/2);
        ctx.lineTo(barX + barHeight/2, barY + barHeight);
        ctx.arc(barX + barHeight/2, barY + barHeight/2, barHeight/2, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.fill();
        
        // XP progress bar
        const progressWidth = (progressPercent / 100) * barWidth;
        
        const progressGradient = ctx.createLinearGradient(barX, 0, barX + progressWidth, 0);
        progressGradient.addColorStop(0, '#5865F2');
        progressGradient.addColorStop(1, '#57F287');
        
        ctx.fillStyle = progressGradient;
        
        // Rounded rectangle for progress
        if (progressWidth > barHeight) {
            ctx.beginPath();
            ctx.moveTo(barX + barHeight/2, barY);
            ctx.lineTo(barX + Math.min(progressWidth, barWidth) - barHeight/2, barY);
            ctx.arc(barX + Math.min(progressWidth, barWidth) - barHeight/2, barY + barHeight/2, barHeight/2, -Math.PI/2, Math.PI/2);
            ctx.lineTo(barX + barHeight/2, barY + barHeight);
            ctx.arc(barX + barHeight/2, barY + barHeight/2, barHeight/2, Math.PI/2, -Math.PI/2);
            ctx.closePath();
            ctx.fill();
        } else if (progressWidth > 0) {
            // Small progress circle for very low progress
            ctx.beginPath();
            ctx.arc(barX + barHeight/2, barY + barHeight/2, barHeight/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Progress percentage text
        ctx.font = 'bold 16px Whitney';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(progressPercent)}%`, barX + barWidth / 2, barY + barHeight / 2 + 6);
        
        // Total message count
        ctx.textAlign = 'right';
        ctx.font = '18px Whitney';
        ctx.fillStyle = '#72767d';
        ctx.fillText(`Messages: ${userData.messages}`, canvas.width - 20, 40);
        
        // Convert canvas to attachment
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'level-card.png' });
        
        // Send level card
        await interaction.editReply({
            files: [attachment]
        });
    }
};