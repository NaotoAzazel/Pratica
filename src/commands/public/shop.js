import { EmbedBuilder } from "@discordjs/builders";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, 
  SlashCommandBuilder, TextInputBuilder, TextInputStyle, ChannelType } from "discord.js";
import UserService from "../../service/UserService.js";
import { getJSONData } from "../../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Покупайте товары за коины"),

  async execute(interaction) {
    const products = [
      { name: "Роли", description: "Роли с неограниченым сроком действия", emoji: "⭐" },
      { name: "Личная комната", description: "(**Work in progress**)\nСобственный, настраиваемый голосовой канал", emoji: "🎤", isDisable: true },
    ];

    try {
      const coins = await UserService.getBalanceById(interaction.user.id);

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

        switch(customId) {
          case "Роли": buyCustomRole(buttonInteraction, coins); break;
          case "Личная комната": buyOwnVoiceRoom(buttonInteraction, coins); break;
          case "buy": showModal(buttonInteraction); break;
        }
      });
    } catch(err) {
      console.log(err);
    }
  }
}

async function buyCustomRole(interaction, coins) {
  const { customRolePrice } = getJSONData("globalVariables.json");
  const isCanBuy = coins >= customRolePrice;

  const replyEmbed = new EmbedBuilder()
    .setTitle("Кастомная роль")
    .setDescription(`${interaction.user}, кастомная роль предостваляет...\n\n**Ваш баланс: ${coins}  :coin:**\nЁё можна приобрести командой \`\`/role create\`\``)
    .setFooter({ text: isCanBuy ? null : "У вас недостаточно монет для покупки личной комнаты" })
    .setColor(2829617)

  await interaction.reply({ embeds: [replyEmbed], ephemeral: true });
}

async function buyOwnVoiceRoom(interaction, coins) {
  const { privateChannelPrice } = getJSONData("globalVariables.json");
  const isCanBuy = coins >= privateChannelPrice;

  const buyButton = new ButtonBuilder()
    .setCustomId("buy")
    .setLabel(`Купить личную комнату за ${privateChannelPrice} монет`)
    .setEmoji("🛒")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(!isCanBuy)

  const replyEmbed = new EmbedBuilder()
    .setTitle("Личная комната")
    .setDescription(`${interaction.user}, личная комната предоставляет...\n\n**Ваш баланс: ${coins}  :coin:**`)
    .setColor(2829617)
    .setFooter({ text: isCanBuy ? null : "У вас недостаточно монет для покупки личной комнаты" })

  const row = new ActionRowBuilder().addComponents(buyButton);

  await interaction.reply({ embeds: [replyEmbed], components: [row], ephemeral: true });
}

async function showModal(interaction) {
  const modal = new ModalBuilder({
    custom_id: `MyModal-${interaction.user.id}`,
    title: "Личная комната",
  });

  const channelNameInput = new TextInputBuilder({
    custom_id: "channelName",
    label: "Введите название голосового канала",
    style: TextInputStyle.Short,
    maxLength: 20,
    required: true
  });

  const firstActionRow = new ActionRowBuilder().addComponents(channelNameInput);

  modal.addComponents(firstActionRow);

  try {
    const hasRoom = await hasPrivateRoom(interaction.user.id);
    if(hasRoom) {
      return await interaction.reply({ content: "Нельзя купить больше одной комнаты!", ephemeral: true });
    }

    await interaction.showModal(modal);

    const filter = (i) => i.user.id === interaction.user.id;

    await interaction
      .awaitModalSubmit({ filter, time: 3_600 * 1_000 })
      .then(async(modalInteraction) => {
        const channelNameValue = modalInteraction.fields.getTextInputValue("channelName");
        
        const newlyCreatedCategory = await interaction.guild.channels.create({
          name: `private-channels-${interaction.user.username}`,
          type: ChannelType.GuildCategory, 
        });

        await newlyCreatedCategory.children.create({ 
          name: channelNameValue, 
          type: ChannelType.GuildVoice,
        });

        await modalInteraction.reply({ content: "Вы успешно купили личную комнату.", ephemeral: true });
      })
      .catch(error => {
        console.error(error);
      })
  } catch(err) {}
}

async function hasPrivateRoom(id) {
  const { privateChannels } = getJSONData("globalVariables.json");
  
  privateChannels.forEach((obj) => {
    for (const [key] of Object.entries(obj)) {
      if(id === key) return true;
    }
  });

  return false;
}