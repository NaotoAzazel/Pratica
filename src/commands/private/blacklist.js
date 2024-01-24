import { EmbedBuilder, SlashCommandBuilder, ChannelType, PermissionFlagsBits } from "discord.js";
import { getJSONData } from "../../utils.js";
import fs from "fs";

export default {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Каналы за которые не дают монеты")
    .addSubcommand(option => 
      option.setName("add")
        .setDescription("Добавляет канал в черный список")
        .addChannelOption(option => 
          option.setName("channeltoadd")
            .setDescription("Выберите канал")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ) 
    )
    .addSubcommand(option => 
      option.setName("remove")
        .setDescription("Удаляет канал из черного списка")
        .addChannelOption(option => 
          option.setName("channeltoremove")
            .setDescription("Выберите канал")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ) 
    )
    .addSubcommand(option => 
      option.setName("view")
        .setDescription("Просмотр каналов черного списка")  
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    
    const channelToAdd = interaction.options.getChannel("channeltoadd");
    const channelToRemove = interaction.options.getChannel("channeltoremove");

    const currentData = getJSONData("globalVariables.json");
    const { blacklistChannelIds } = currentData;

    switch(subCommand) {
      case "add": {
        if(!blacklistChannelIds.includes(channelToAdd.id)) {
          currentData.blacklistChannelIds.push(channelToAdd.id);
          fs.writeFileSync("globalVariables.json", JSON.stringify(currentData, null, 2));

          return await interaction.reply({ content: "Канал был успешно добавлен" });
        } else {
          return await interaction.reply({ content: "Этот канал уже в черном списке" });
        }
      }

      case "remove": {
        if(!blacklistChannelIds.includes(channelToRemove.id)) {
          return await interaction.reply({ content: "Такого  канала нет в черном списке" });
        } else {
          currentData.blacklistChannelIds = currentData.blacklistChannelIds.filter(id => id !== channelToRemove.id);
          fs.writeFileSync("globalVariables.json", JSON.stringify(currentData, null, 2));
          
          return await interaction.reply({ content: "Канал был успешно удалён" });
        }
      }

      case "view": {
        const embed = new EmbedBuilder()
          .setTitle("Каналы черного списка")
          .setDescription(blacklistChannelIds.map(channelId => `<#${channelId}>`).join(", "))
          .setColor(2829617)
          .setTimestamp()

        return await interaction.reply({ embeds: [embed] });
      }
    }
  }
}