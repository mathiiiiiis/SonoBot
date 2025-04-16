const Canvas = require('canvas');
const config = require('../config');
const { AttachmentBuilder } = require('discord.js');
const path = require('path');

Canvas.registerFont(path.join(__dirname, '../assets/fonts/Whitney-Medium-new.ttf'), { family: 'Whitney' });
Canvas.registerFont(path.join(__dirname, '../assets/fonts/Whitney-Bold-new.ttf'), { family: 'Whitney Bold' });

class CanvasUtils {
    /**
     * Creates a Discord-styled welcome image
     * @param {Object} member - Guild member
     * @returns {Promise<AttachmentBuilder>} - Discord attachment
     */
    static async createWelcomeImage(member) {
        const canvas = Canvas.createCanvas(1100, 500);
        const ctx = canvas.getContext('2d');
        
        // Solid background
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width - 100, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const accentGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        accentGradient.addColorStop(0, '#FF4893');
        accentGradient.addColorStop(1, '#FF489333');
        
        ctx.fillStyle = accentGradient;
        ctx.fill();
        
        // Draw server icon if available
        try {
            if (member.guild.iconURL()) {
                const serverIcon = await Canvas.loadImage(member.guild.iconURL({ extension: 'png', size: 128 }));
                
                ctx.save();
                const iconX = canvas.width - 190;
                const iconY = canvas.height - 190;
                const iconSize = 160;
                const cornerRadius = 20;
                ctx.beginPath();
                ctx.moveTo(iconX + cornerRadius, iconY);
                ctx.lineTo(iconX + iconSize - cornerRadius, iconY);
                ctx.quadraticCurveTo(iconX + iconSize, iconY, iconX + iconSize, iconY + cornerRadius);
                ctx.lineTo(iconX + iconSize, iconY + iconSize - cornerRadius);
                ctx.quadraticCurveTo(iconX + iconSize, iconY + iconSize, iconX + iconSize - cornerRadius, iconY + iconSize);
                ctx.lineTo(iconX + cornerRadius, iconY + iconSize);
                ctx.quadraticCurveTo(iconX, iconY + iconSize, iconX, iconY + iconSize - cornerRadius);
                ctx.lineTo(iconX, iconY + cornerRadius);
                ctx.quadraticCurveTo(iconX, iconY, iconX + cornerRadius, iconY);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(serverIcon, iconX, iconY, iconSize, iconSize);
                ctx.restore();
            }
        } catch (error) {
            console.error('Error loading server icon:', error);
        }
        
        // Avatar setup
        const avatarSize = 220;
        const avatarX = 100;
        const avatarY = canvas.height / 2 - avatarSize / 2;
        
        // Avatar border
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4893';
        ctx.fill();
        ctx.closePath();
        
        // Load and draw avatar
        try {
            const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
            
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();
        } catch (error) {
            console.error('Error loading avatar:', error);
        }
        
        ctx.save();
        
        // Text positioning
        const textX = avatarX + avatarSize + 60;
        
        // Welcome text
        ctx.font = '54px "Whitney Bold"';
        ctx.fillStyle = '#FF4893';
        ctx.textAlign = 'left';
        ctx.fillText(`Welcome`, textX, 150);
        
        // Username
        ctx.font = 'bold 72px "Whitney Bold"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(member.user.username, textX, 230);
        
        // Member
        ctx.font = '32px "Whitney"';
        ctx.fillStyle = '#FF4893';
        const memberCountText = `Member #${member.guild.memberCount}`;
        ctx.fillText(memberCountText, textX, 290);
        
        // Server name
        ctx.font = '28px "Whitney"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`Welcome to ${member.guild.name}!`, textX, 350);
        
        // Date with new color
        const now = new Date();
        const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        ctx.font = '26px "Whitney"';
        ctx.fillStyle = '#FF4893';
        ctx.fillText(now.toLocaleDateString('en-US', dateOptions), textX, 400);
        
        ctx.restore();
        
        return new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
    }
}

module.exports = CanvasUtils;