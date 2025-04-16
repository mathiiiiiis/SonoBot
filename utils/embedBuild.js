const { EmbedBuilder } = require('discord.js');

class EmbedUtils {
  static createBasicEmbed(title, description, color = '#5865F2') {
    return new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .setTimestamp();
  }
  
  static createQueueEmbed(queue) {
    const currentSong = queue.songs[0];
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('Music Queue')
      .setDescription(`Now Playing: **${currentSong.title}**`);
    
    const upcoming = queue.songs.slice(1).map((song, i) => `${i + 1}. ${song.title}`).join('\n');
    embed.addFields({ name: 'Up Next', value: upcoming || 'No more songs' });
    
    return embed;
  }
  
  static createErrorEmbed(message) {
    return new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('Error')
      .setDescription(message);
  }
}

module.exports = EmbedUtils;