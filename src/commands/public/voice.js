import { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, 
  ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { getJSONData } from "../../utils.js";
import VoiceController from "../../controller/VoiceController.js";
import UserController from "../../controller/UserController.js";

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
    const everyoneRole = interaction.guild.roles.everyone.id;
    const isRoomExists = await VoiceController.isRoomExists(interaction.user.id).catch(err => { console.error(err.message) });

    switch(subCommand) {
      case "buy": {
        try {
          const { voiceChannelsCategoryId, privateChannelPrice } = getJSONData("globalVariables.json");
          const channelName = interaction.options.getString("name");
          
          if(isRoomExists) {
            return await interaction.reply({ content: "Вы не можете купить больше одной комнаты", ephemeral: true });
          }

          const balance = await UserController.getBalanceById(interaction.user.id);
          if(balance < privateChannelPrice) {
            return await interaction.reply({ content: "На вашем балансе недостаточно средств для покупки комнаты", ephemeral: true });
          }
          
          const newChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: voiceChannelsCategoryId,
            permissionOverwrites: [
              {
                id: everyoneRole,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
              },
              {
                id: interaction.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
              }
            ]
          });

          await VoiceController.create(interaction.user.id, newChannel?.id);
          await UserController.updateBalanceById(interaction.user.id, privateChannelPrice, "decrement");

          return await interaction.reply({ 
            content: `Вы успешно купили канал <#${newChannel.id}>. Он добавился в категорию: <#${voiceChannelsCategoryId}>`,
            ephemeral: true
          });
        } catch(err) {
          console.error("Error in voice command(buy):", err.message);
        }
      }

      case "configure": {
        try {
          const productButtons = [
            { name: "Переиминовать", emoji: "🖊" },
            { name: "Скрыть", emoji: "🔐" },
            { name: "Показать", emoji: "🔑" },
            { name: "Удалить", emoji: "❌" }
          ];

          const userButtons = [
            { name: "Добавить пользователя", emoji: "🤵" },
            { name: "Удалить пользователя", emoji: "🧦" },
            { name: "Лимит пользователей", emoji: "🎰" },
          ];
          
          if(!isRoomExists) {
            return await interaction.reply({ content: "Не удалось найти ваших комнат", ephemeral: true });
          }
          
          const { voiceId } = await VoiceController.getOne(interaction.user.id);

          const targetChannel = await interaction.guild.channels.fetch(voiceId);
          if(!targetChannel) {
            return await interaction.reply({ content: "Не удалось найти канал на этом сервере", ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setTitle("Кастомизация комнаты")
            .setDescription(`Кастомизируйте свою комнату <#${voiceId}>`)
            .setColor(2829617)

          const roomCustomizationButtons = productButtons.map(({ name, emoji }) => {
            return new ButtonBuilder()
              .setCustomId(name)
              .setLabel(name)
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emoji)
          });

          const userInteractionButtons = userButtons.map(({ name, emoji }) => {
            return new ButtonBuilder()
              .setCustomId(name)
              .setLabel(name)
              .setStyle(ButtonStyle.Secondary)
              .setEmoji(emoji)
          });

          const roomCustomizationRow = new ActionRowBuilder().addComponents(roomCustomizationButtons);
          const userInteractionRow = new ActionRowBuilder().addComponents(userInteractionButtons);

          const reply = await interaction.reply({ embeds: [embed], components: [roomCustomizationRow, userInteractionRow], ephemeral: true });
          const collector = reply.createMessageComponentCollector({ filter: (i) => i.user.id === interaction.user.id });

          collector.on("collect", async(buttonInteraction) => {
            const { customId } = buttonInteraction;

            const channel = await interaction.guild.channels.fetch(voiceId);
            if(!channel) {
              return await interaction.reply({ content: "Не удалось найти канал на этом сервере", ephemeral: true }); 
            }

            const labels = { 
              "Переиминовать": "Напишите новое название канала",
              "Добавить пользователя": "Напишите айди пользователя",
              "Удалить пользователя": "Напишите айди пользователя",
              "Лимит пользователей": "Напишите число(1 - 99)"
            };

            const modal = new ModalBuilder({
              customId: `modal-${interaction.user.id}`,
              title: customId
            });

            const fieldInput = new TextInputBuilder({
              customId: "field",
              label: labels[customId],
              style: TextInputStyle.Short,
              minLength: 1,
              maxLength: 30
            });

            const actionRow = new ActionRowBuilder().addComponents(fieldInput);
            modal.addComponents(actionRow);

            const filter = (i) => i.user.id === buttonInteraction.user.id;
            const interactionTime = 3600 * 1000;

            try {
              switch(customId) {
                case "Переиминовать": {
                  await buttonInteraction.showModal(modal);
                  await buttonInteraction
                    .awaitModalSubmit({ filter, time: interactionTime })
                    .then(async(modalInteraction) => {
                      const newChannelName = modalInteraction.fields.getTextInputValue("field");
                      targetChannel.setName(newChannelName);
  
                      await modalInteraction.reply({ content: `Название канало изменено на **${newChannelName}**`, ephemeral: true }); 
                    });
                  break;
                }

                case "Скрыть": {
                  await targetChannel.permissionOverwrites
                    .edit(everyoneRole, { ViewChannel: false })
                    .catch();

                  return await buttonInteraction.reply({ content: "Вы успешно скрыли канал", ephemeral: true });
                }

                case "Показать": {
                  await targetChannel.permissionOverwrites
                    .edit(everyoneRole, { ViewChannel: true })
                    .catch();

                  return await buttonInteraction.reply({ content: "Вы успешно показали канал", ephemeral: true });
                }

                case "Удалить": {
                  targetChannel.delete();
                  await VoiceController.deleteOne(interaction.user.id);

                  embed
                    .setTitle("Канал удален")
                    .setDescription("Вы больше не можете взаимодействовать с этим каналом так как он удален")
                  
                  await interaction.editReply({ embeds: [embed], components: [], ephemeral: true }); 
                  return await buttonInteraction.reply({ content: "Вы успешно удалили свой канал", ephemeral: true });
                }

                case "Добавить пользователя": {
                  await buttonInteraction.showModal(modal);
                  await buttonInteraction
                    .awaitModalSubmit({ filter, time: interactionTime })
                    .then(async(modalInteraction) => {
                      await handleUserAction(modalInteraction, targetChannel, true);
                    });
                  break;
                }

                case "Удалить пользователя": {
                  await buttonInteraction.showModal(modal);
                  await buttonInteraction
                    .awaitModalSubmit({ filter, time: interactionTime })
                    .then(async(modalInteraction) => {
                      await handleUserAction(modalInteraction, targetChannel, false);
                    });
                  break;
                }

                case "Лимит пользователей": {
                  await buttonInteraction.showModal(modal);
                  await buttonInteraction
                    .awaitModalSubmit({ filter, time: interactionTime })
                    .then(async(modalInteraction) => {
                      const newUserLimit = modalInteraction.fields.getTextInputValue("field");
                      const userLimitRegex = /^(?:[1-9]|[1-9][0-9])$/;

                      if(!userLimitRegex.test(newUserLimit)) {
                        return await modalInteraction.reply({ content: "Введите валидное число(1 - 99)", ephemeral: true });
                      }

                      await targetChannel.setUserLimit(newUserLimit);
                      await modalInteraction.reply({ 
                        content: `Лимит пользователей ${targetChannel} был изменен на **${newUserLimit}**`,
                        ephemeral: true
                      });
                    })
                  break;
                }
              }
            } catch(err) {
              console.error("Error in voice configure(button interaction):", err.message);
            }
          });

          break;
        } catch(err) {
          console.log("Error in voice command(configure):", err.message)
        }
      }
    }
  }
}

async function handleUserAction(modalInteraction, targetChannel, allowAccess) {
  const userId = modalInteraction.fields.getTextInputValue("field");
  const discordIdRegex = /(\d{17,19})/;

  if (!discordIdRegex.test(userId)) {
    return await modalInteraction.reply({
      content: "Введите валидное айди пользователя",
      ephemeral: true,
    });
  }

  const specifiedUser = await modalInteraction.guild.members.fetch(userId);
  if (!specifiedUser) {
    return await modalInteraction.reply({
      content: `<@${userId}> не удалось найти на сервере`,
      ephemeral: true,
    });
  }

  await targetChannel.permissionOverwrites
    .edit(specifiedUser, { ViewChannel: allowAccess, Connect: allowAccess })
    .catch();

  const actionText = allowAccess ? "добавлен" : "удален";
  return await modalInteraction.reply({
    content: `<@${userId}> успешно ${actionText} из канала`,
    ephemeral: true,
  });
};