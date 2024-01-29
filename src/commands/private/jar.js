import { SlashCommandBuilder } from "discord.js";
import { getJSONData } from "../../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("jar")
    .setDescription("Выдает роль jar пользователю")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Выберите пользователя")
        .setRequired(true)  
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");

    if(targetUser.bot) {
      return await interaction.reply({ content: "Вы не можете взаимодействовать с ботом", ephemeral: true });
    }

    try {
      const { jarRoleId } = getJSONData("globalVariables.json");
      const fetchedUser = await interaction.guild.members.fetch(targetUser);

      const role = await interaction.guild.roles.fetch(jarRoleId);
      const hasRole = await fetchedUser.roles.cache.has(role.id);

      if(hasRole) { 
        return await interaction.reply({ content: "Этот пользователь уже в тюрьме", ephemeral: true });
      }

      await fetchedUser.roles.add(role);
      await interaction.reply({ content: "Вы успешно поместили участника в тюрьму", ephemeral: true });
    } catch(err) {
      console.error("Error in jar command:", err.message);
    }
  }
}