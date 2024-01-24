import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Выдает тайм-аут пользователю")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Пользователь которому выдадится тайм-аут")  
        .setRequired(true)
    )
    .addNumberOption(option => 
      option.setName("time")
        .setDescription("Продолжительность тайм-аута")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("time-type")
        .setDescription("Выберите тип времени") 
        .addChoices(
          { name: "second", value: "s" },
          { name: "minute", value: "m" },
          { name: "hour", value: "h" },
          { name: "day", value: "d" }
        )
        .setRequired(true) 
    )
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Причина")  
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
      const mentionable = interaction.options.get("user").value;
      const time = interaction.options.getNumber("time");
      const type = interaction.options.getString("time-type");
      const reason = interaction.options.getString("reason") || "Причина не указана";

      const targetUser = await interaction.guild.members.fetch(mentionable);
      if(targetUser.user.bot) {
        return await interaction.reply({ content: "Я не могу отправить тайм-аут боту", ephemeral: true });
      }

      const formattedTime = formatTime(time, type);
      if(formattedTime < 5000 || formattedTime > 2.419e9) {
        return await interaction.reply({ content: "Укажите валидное время для тайм-аута(не меньше 10сек. и не больше 20 дней)", ephemeral: true });
      }

      try {
        if(targetUser.isCommunicationDisabled()) {
          await targetUser.timeout(formattedTime, reason);
          return await interaction.reply({ content: `Тайм-аут ${targetUser} был изменен на ${time}${type}`, ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle("Пользователю выдан тайм-аут")
          .setColor(2829617)
          .addFields(
            { name: "Пользователь", value: targetUser?.user?.username, inline: true },
            { name: "Причина", value: reason, inline: true },
            { name: "Продолжительность", value: `${time}${type}`, inline: true }
          )
          .setTimestamp()
        
        await targetUser.timeout(formattedTime, reason);
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch(err) {
        console.log("Error when trying to timeout", err.message);
      }
    }
}

function formatTime(time, type) {
  const timeFactors = {
    "s": 1_000,
    "m": 60_000,
    "h": 3_600_000,
    "d": 86_400_000
  };

  return time * timeFactors[type] || 0;
}