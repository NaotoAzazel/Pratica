import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import UserController from "../../controller/UserController.js";

export default {
  data: new SlashCommandBuilder()
    .setName("duel")
    .setDescription("Вызовите пользователя на дуэль за коины")
    .addUserOption(option => 
      option.setName("username")
        .setDescription("Username")
        .setRequired(true)
    )
    .addIntegerOption(option => 
      option
        .setName("coins") 
        .setDescription("Введите число коинов")
        .setRequired(true)
        .setMinValue(10)
        .setMaxValue(100000)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("username");
    const duelCoins = interaction.options.getInteger("coins");
    const { id: ownId, username } = interaction.user;

    if(ownId === targetUser.id || targetUser.bot) {
      return interaction.reply({ content: "Вы не можете отправить дуэль самому себе или боту", ephemeral: true });
    }

    try {
      const enemyBalance = await UserController.getBalanceById(targetUser.id);
      const ownBalance = await UserController.getBalanceById(ownId);

      if(duelCoins > enemyBalance) {
        return interaction.reply({ 
          content: "Вы не можете отправить дуэль. У противника нет столько монет", 
          ephemeral: true 
        });
      }

      if(duelCoins > ownBalance) {
        return interaction.reply({ 
          content: "Вы не можете отправить дуэль. На вашем счету недостаточно монет.", 
          ephemeral: true
        });
      }

      const percentageIncrease = 100;
      const increasedAmount = duelCoins * (1 + percentageIncrease / 100);
      
      const duelEmbed = new EmbedBuilder()
        .setTitle("Дуэль")
        .setDescription(`<@${ownId}> vs ${targetUser}\nСтавка дуэли: **${duelCoins}** :coin:\nПобедитель получил **100%** от ставки на баланс(**+${increasedAmount}**)`)
        .setColor("Blue")
        .setFooter({ text: "От дуэли можно отказаться или принять нажав ниже" })
        .setTimestamp()

      const confirm = new ButtonBuilder()
        .setCustomId(`confirm-duel-${targetUser}-${duelCoins}`)
        .setLabel("Принять")
        .setStyle(ButtonStyle.Success)
        
      const cancel = new ButtonBuilder()
        .setCustomId(`cancel-duel-${targetUser}-${duelCoins}`)
        .setLabel("Отказаться")
        .setStyle(ButtonStyle.Danger)
        
      const row = new ActionRowBuilder()
        .addComponents(confirm, cancel);
    
      const reply = await interaction.reply({ 
        content: `${targetUser}, вас вызвал(а) на дуэль <@${ownId}>.`,
        embeds: [duelEmbed],
        components: [row]
      });

      const targetUserInteraction = await reply.awaitMessageComponent({
        filter: (i) => i.user.id === targetUser.id,
        time: 30_000,
      }).catch(async(err) => {
        duelEmbed.setDescription(`Время вышло. ${targetUser} не ответил вовремя.`);
        await reply.edit({ embeds: [duelEmbed], components: [] });
      });

      if(!targetUserInteraction) return;
      else {
        const randomNumber1 = Math.round(Math.random() * 100);
        const randomNumber2 = Math.round(Math.random() * 100);
        
        let result;
        if(randomNumber1 > randomNumber2) {
          result = `Победил **${username}**, с числом **${randomNumber1}**.`;
          
          await Promise.all([
            UserController.updateBalanceById(ownId, duelCoins, "increment"),
            UserController.updateBalanceById(targetUser.id, duelCoins, "decrement"),
          ]);
        } else if(randomNumber1 == randomNumber2) {
          result = `**Ничья**, оба числа равны.`
        } else {
          result = `Победил **${targetUser.username}**, с числом **${randomNumber2}**.`;

          await Promise.all([
            UserController.updateBalanceById(ownId, duelCoins, "decrement"),
            UserController.updateBalanceById(targetUser.id, duelCoins, "increment"),
          ]);
        } 

        duelEmbed.setDescription(null);
        duelEmbed.setFooter(null);
        duelEmbed.addFields(
          { name: username, value: `Получает случайное число (0-100): **${randomNumber1}**` },
          { name: targetUser.username, value: `Получает случайное число (0-100): **${randomNumber2}**` },
          { name: "Результат дуэли", value: result + `\nСумма выиграша: **${increasedAmount}**` }
        );

        await reply.edit({ embeds: [duelEmbed], components: [], content: "" });
      }
    } catch(err) {
      console.log(err);
    }
  }
}