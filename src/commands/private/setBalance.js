import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserService from "../../service/UserService.js";

export default {
  data: new SlashCommandBuilder()
    .setName("setbalance")
    .setDescription("Устанавливает баланс выбраному пользователю")
    .addUserOption(option => 
      option.setName("username")
        .setDescription("Username")
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option
        .setName("coins") 
        .setDescription("Введите число коинов")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(10000000)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("username");
    const coins = interaction.options.getInteger("coins");

    await interaction.deferReply();
    
    try {
      if(targetUser.bot) {
        return interaction.reply({ content: "Вы не можете выдать монет боту", ephemeral: true });
      }
  
      await UserService.updateBalanceById(targetUser.id, coins, "set")
      await interaction.editReply({ content: `Вы успешно выдали **${coins}** пользователю ${targetUser}`, ephemeral: true });
    } catch(err) {
      interaction.reply({ content: `Произошла ошибка: ${err.message}`, ephemeral: true });
    }
  }
}