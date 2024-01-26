import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserController from "../../controller/UserController.js";
import { getJSONData } from "../../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Покупайте товары за коины"),

  async execute(interaction) {
    const products = [
      { name: "Кастомная роль", description: "Роли с неограниченым сроком действия", emoji: "⭐" },
      { name: "Личная комната", description: "Собственный, настраиваемый голосовой канал", emoji: "🎤" },
    ];

    try {
      let coins = await UserController.getBalanceById(interaction.user.id);

      const shopEmbed = new EmbedBuilder()
        .setTitle(`Магазин товаров ${interaction.member.guild.name}`)
        .setThumbnail(interaction.guild.iconURL())
        .setColor(2829617)

      products.map(({ name, description, emoji }) => {
        shopEmbed.addFields({ name: `${emoji} — **${name}**`, value: description })
      });

      shopEmbed.addFields({ name: ":dollar: Баланс", value: `${coins}  :coin:`} )

      const buttons = products.map(({ name, emoji, isDisable }) => {
        return new ButtonBuilder()
          .setCustomId(name)
          .setLabel(name)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(emoji)
          .setDisabled(isDisable ? isDisable : false)
      });
      
      const row = new ActionRowBuilder().addComponents(buttons);
      const reply = await interaction.reply({ embeds: [shopEmbed], components: [row] });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = reply.createMessageComponentCollector({ filter, time: 3_600 * 1_000 });

      collector.on("collect", async (buttonInteraction) => {
        const { customId } = buttonInteraction;

        const { customRolePrice, privateChannelPrice, voiceChannelsCategoryId } = getJSONData("globalVariables.json");
        coins = await UserController.getBalanceById(interaction.user.id);

        const messageTemplates  = {
          "Кастомная роль": `${interaction.user}, **кастомная роль** предоставляет вам уникальную роль, для который вы сами можете выбрать цвет, название и иконку. Пожалуйста, удостоверьтесь, что **название роли** соответствует правилам и **не содержит нецензурных или оскорбительных выражений**. Один пользователь **может иметь только одну кастомную роль.**\n\n**Ваш баланс: ${coins}  :coin:**\nЁё можна приобрести командой \`\`/role create\`\``,
          "Личная комната": `${interaction.user}, **личная комната** предоставляется в категорию <#${voiceChannelsCategoryId}> со своим личным голосовым каналом. Вы можете им **управлять: переиминовывать, скрывать, показывать, удалить, добавить пользователя, удалить пользователя и задать лимит пользователей** - все это выполняется командой **/voice configure**. Один пользователь **может иметь только одну личную комнату.**\n\n**Ваш баланс: ${coins}  :coin:**\nЁё можна приобрести командой \`\`/voice buy\`\``
        };

        const prices = {
          "Кастомная роль": customRolePrice,
          "Личная комната": privateChannelPrice,
        };

        const isCanBuy = coins >= prices[customId];

        const replyEmbed = new EmbedBuilder()
          .setTitle(customId)
          .setDescription(messageTemplates[customId])
          .setThumbnail(interaction.user.displayAvatarURL())
          .setFooter({ text: !isCanBuy ? "У вас недостаточно монет для покупки" : null })
          .setColor(2829617)

        try {
          switch(customId) {
            case "Кастомная роль": {
              return await buttonInteraction.reply({ embeds: [replyEmbed], ephemeral: true });
            }

            case "Личная комната": {
              return await buttonInteraction.reply({ embeds: [replyEmbed], ephemeral: true });
            }
          }
        } catch(err) {
          console.error("Error in shop command(button interaction):", err.message);
        }
      });
    } catch(err) {
      console.log("Error in shop command:", err.message);
    }
  }
}