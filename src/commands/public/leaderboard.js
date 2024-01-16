import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import profileSchema from "../../schema/profileSchema.js";

export default {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Показывает топ 10 пользователей по балансу"),
  
  async execute(interaction) {
    await interaction.deferReply();

    const { username, id } = interaction.user;

    const leaderboardEmbed = new EmbedBuilder()
      .setTitle("Список лидеров")
      .setColor(2829617)
      .setDescription({ text: "У вас еще нет ранга" })

    try {
      const users = await profileSchema
        .find()
        .sort({ coins: -1 })
        .catch((err) => console.log("Error while fetching users", err));
  
      const usersIndex = users.findIndex((member) => member.userId === id);
      leaderboardEmbed.setDescription({
        text: `${username}, ваша позиция в топе: ${usersIndex + 1}`
      });
  
      const topTen = users.slice(0, 10);
  
      for(let i = 0; i < topTen.length; i++) {
        const userProfile = topTen[i];

        if (!userProfile || !userProfile.userId) {
          console.error("Invalid user profile:", userProfile);
          continue;
        }

        try {
          const member = await interaction.guild.members.fetch(userProfile.userId);
          const user = member.user;
      
          const userBalance = userProfile.coins;
          leaderboardEmbed.addFields({ 
            name: `#${i + 1}. **${user.username}**`, 
            value: `Всего монет: ${String(userBalance)}` 
          });
        } catch (err) {
          console.log("Error while fetching user:", err);
          continue;
        }
      }
      
      await interaction.editReply({ embeds: [leaderboardEmbed] });
    } catch(err) {
      console.log(err);
    }

  }
}