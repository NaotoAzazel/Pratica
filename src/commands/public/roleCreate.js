import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import UserService from "../../service/UserService.js";
import { getJSONData } from "../../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("role-create")
    .setDescription("Покупка кастомной роли")
    .addStringOption(option =>
      option.setName("название")
        .setDescription("Введите название роли")
        .setMinLength(1) 
        .setMaxLength(30)
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("цвет")
        .setDescription("Выберите цвет для роли (using Discord defaults)")
        .setRequired(true)
        .addChoices(
          { name: 'Aqua', value: 'Aqua' },
          { name: 'Green', value: 'Green' },
          { name: 'Blue', value: 'Blue' },
          { name: 'Yellow', value: 'Yellow' },
          { name: 'LuminousVividPink', value: 'LuminousVividPink' },
          { name: 'Fuchsia', value: 'Fuchsia' },
          { name: 'Gold', value: 'Gold' },
          { name: 'Orange', value: 'Orange' },
          { name: 'Red', value: 'Red' },
          { name: 'Grey', value: 'Grey' },
          { name: 'Navy', value: 'Navy' },
          { name: 'DarkAqua', value: 'DarkAqua' },
          { name: 'DarkGreen', value: 'DarkGreen' },
          { name: 'DarkBlue', value: 'DarkBlue' },
          { name: 'DarkPurple', value: 'DarkPurple' },
          { name: 'DarkVividPink', value: 'DarkVividPink' },
          { name: 'DarkGold', value: 'DarkGold' },
          { name: 'DarkOrange', value: 'DarkOrange' },
          { name: 'DarkRed', value: 'DarkRed' },
          { name: 'DarkerGrey', value: 'DarkerGrey' },
          { name: 'LightGrey', value: 'LightGrey' },
          { name: 'DarkNavy', value: 'DarkNavy' },
          { name: 'Blurple', value: 'Blurple' },
          { name: 'Greyple', value: 'Greyple' },
          { name: 'DarkButNotBlack', value: 'DarkButNotBlack' }
        )
    )
    .addAttachmentOption(option =>
      option.setName("значок")
        .setDescription("Выберите значок роли(менее 256 Kб, 64x64)")
    ),
  async execute(interaction, client) {
    const attachment = interaction.options.getAttachment("значок");
    const roleName = interaction.options.getString("название");
    const color = interaction.options.getString("цвет");

    try {
      const userBalance = UserService.getBalanceById(interaction.user.id);
      const existingRole = interaction.guild.roles.cache.find(role => role.name === roleName);

      const { customRolePrice } = getJSONData("globalVariables.json");

      if(attachment) {
        const fileSizeInBytes = attachment?.size;
        const fileSizeInKB = fileSizeInBytes / 1024;

        if (fileSizeInKB > 256) {
          return await interaction.reply({ 
            content: `Выбранный файл слишком большой. Выберите файл размером менее 256 Кб. Ваш весит: ${fileSizeInKB} Кб.`, 
            ephemeral: true 
          });
        }
      }

      if(existingRole) {
        return await interaction.reply({ 
          content: `Роль с таким названием уже существует.`, 
          ephemeral: true 
        });
      }

      if(userBalance < customRolePrice) {
        return await interaction.reply({ content: `У вас недостаточно средств на балансе`, ephemeral: true });
      }
  
      await interaction.reply({ 
        content: "Вы успешно купили кастомную роль. Дождитесь её верификации от Администрации. После верификации роль автоматически будет выдана вам, в случае отказа вам будет отправлено сообщение.",
        ephemeral: true
      });
      
      const logEmbed = new EmbedBuilder()
        .setTitle("Верификация кастомной роли")
        .setFields(
          { name: "Название", value: roleName },
          { name: "Цвет", value: color },
          { name: "Покупатель", value: `<@${interaction.user.id}>` }
        )
        .setThumbnail(attachment?.attachment || null)
        .setColor(2829617)
        .setTimestamp()

      const confirm = new ButtonBuilder()
        .setCustomId("conf")
        .setLabel("Одобрить")
        .setStyle(ButtonStyle.Success)
        
      const row = new ActionRowBuilder().addComponents(confirm);

      const { LOG_CHANNEL_ID: logChannelId } = process.env;
      const channel = await client.channels.cache.get(logChannelId);
      
      const logMessage = await channel.send({ embeds: [logEmbed], components: [row] });
      const collector = logMessage.createMessageComponentCollector();

      collector.on("collect", async(buttonInteraction) => {
        const { customId } = buttonInteraction;

        switch(customId) {
          case "conf": {
            try {
              const role = interaction.guild.roles.cache.find(role => role.id === "1195458389489229964");
              const createdRole = await interaction.guild.roles.create({ name: roleName, color, position: role.position + 1, });
              
              if(attachment?.attachment && interaction.guild.premiumTier >= 2) {
                createdRole.setIcon(attachment.attachment);
              }
  
              await interaction.member.roles.add(createdRole.id);
  
              logEmbed
                .setTitle("Верификация успешна")
                .setDescription(`Роль <@&${createdRole.id}> была выдана пользователю <@${interaction.user.id}>\nВерифицировал роль: <@${buttonInteraction.user.id}>`)
                .setColor("Green")
                .setFields([])
  
              await buttonInteraction.update({ embeds: [logEmbed], components: [] });
            } catch(err) {
              console.log(err);
            }
          }
        }
      })
    } catch(err) {
      console.log(err);
    }
  }
}