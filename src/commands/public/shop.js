import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } from "discord.js";
import UserService from "../../service/UserService.js";
import { getJSONData } from "../../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Покупайте товары за коины"),

  async execute(interaction) {
    const products = [
      { name: "Роли", description: "Роли с неограниченым сроком действия", emoji: "⭐" },
      { name: "Личная комната", description: "(**Work in progress**)\nСобственный, настраиваемый голосовой канал", emoji: "🎤" },
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
          case "Роли": return buyCustomRole(buttonInteraction, coins);
          case "Личная комната": return buyOwnVoiceRoom(buttonInteraction, coins);
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

  const replyEmbed = new EmbedBuilder()
    .setTitle("Личная комната")
    .setDescription(`${interaction.user}, личная комната предоставляет...\n\n**Ваш баланс: ${coins}  :coin:**`)
    .setColor(2829617)
    .setFooter({ text: isCanBuy ? null : "У вас недостаточно монет для покупки личной комнаты" })

  await interaction.reply({ embeds: [replyEmbed], components: [row], ephemeral: true });
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