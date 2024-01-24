import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import UserController from "../../controller/UserController.js";

export default {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Показывает баланс пользователя"),
  
  async execute(interaction) {
    try {
      const authorId = interaction.user.id; 
      const coins = await UserController.getBalanceById(authorId);

      const replyEmbed = new EmbedBuilder()
        .setTitle(`Баланс пользователя ${interaction.user.username}`)
        .setDescription(`**Наличные**: ${coins}`)
        .setColor(2829617)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: "Pratica" })
        .setTimestamp()

      await interaction.reply({ embeds: [replyEmbed] });
    } catch(err) {
      console.log(err);
    }
  }
}