import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Убирает тайм-аут у пользователя")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Пользователь которому уберется тайм-аут")  
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const mentionable = interaction.options.get("user").value;
    const targetUser = await interaction.guild.members.fetch(mentionable);

    if(!targetUser.isCommunicationDisabled()) {
      return await interaction.reply({ content: "У этого пользователя нет тайм-аута", ephemeral: true });
    }

    try {
      await targetUser.timeout(null);
      await interaction.reply({ content: `Вы успешно убрали тайм-аут у ${targetUser}`, ephemeral: true });
    } catch(err) {
      console.log("Error when trying to remove timeout", err.message);
    }
  }
}