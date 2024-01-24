import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import UserController from "../../controller/UserController.js";

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

    try {
      if(targetUser.bot) {
        return interaction.reply({ content: "Вы не можете выдать монет боту", ephemeral: true });
      }

      const isUserExist = await UserController.isUserExist(targetUser.id);
      if(!isUserExist) {
        await UserController.create(targetUser.id, 0);
      }
  
      await UserController.updateBalanceById(targetUser.id, coins, "set")
      await interaction.reply({ content: `Вы успешно установили баланс **${coins}** :coin: пользователю ${targetUser}`, ephemeral: true });
    } catch(err) {
      interaction.reply({ content: `Произошла ошибка: ${err.message}`, ephemeral: true });
    }
  }
}