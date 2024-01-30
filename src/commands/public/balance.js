import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import UserController from "../../controller/UserController.js";

export default {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Показывает баланс пользователя"),
  
  async execute(interaction) {
    try {
      const { id, username } = interaction.user; 
      const coins = await UserController.getBalanceById(id);
      const { totalCoinsEarned, totalCoinsSpent } = await UserController.getStatisticsById(id);

      const replyEmbed = new EmbedBuilder()
        .setTitle(`Баланс пользователя ${username}`)
        .setDescription(`**Наличные**: ${coins} :coin:\n\n**Всего монет заработано:** ${totalCoinsEarned} :coin:\n**Всего монет потрачено:** ${totalCoinsSpent} :coin:`)
        .setColor(2829617)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: interaction.guild.name })
        .setTimestamp()

      await interaction.reply({ embeds: [replyEmbed] });
    } catch(err) {
      console.log(err);
    }
  }
}