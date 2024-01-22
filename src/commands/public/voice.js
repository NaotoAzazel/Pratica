import { SlashCommandBuilder, ChannelType, PermissionsBitField } from "discord.js";
import { getJSONData } from "../../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("voice")
    .setDescription("Действия с приватным голосовым каналом")
    .addSubcommand(subCommand => 
      subCommand.setName("buy")
        .setDescription("Покупка приватного голосового канала")
        .addStringOption(option =>
          option.setName("name")
            .setDescription("Название канала")
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(20)
        )
    )
    .addSubcommand(subCommand => 
      subCommand.setName("configure")
        .setDescription("Настройте свой голосовой канал")
    ),

  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand();

    switch(subCommand) {
      case "buy": {
        try {
          const { voiceChannelsCategoryId } = getJSONData("globalVariables.json");
          const channelName = interaction.options.getString("name");
          
          const everyoneRole = interaction.guild.roles.everyone.id;

          const newChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: voiceChannelsCategoryId,
          });

          await newChannel.permissionOverwrites.set([
            {
              id: everyoneRole,
              deny: [PermissionsBitField.Flags.ViewChannel]
            },
            {
              id: interaction.user.id,
              allow: [PermissionsBitField.Flags.ViewChannel]
            }
          ])

          return console.log("Voice channel created")
        } catch(err) {
          console.log("err", err);
        }
      }
    }
  }
}