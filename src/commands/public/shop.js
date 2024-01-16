import { EmbedBuilder } from "@discordjs/builders";
import { SlashCommandBuilder } from "discord.js";
import profileSchema from "../../schema/profileSchema.js";

export default {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Покупайте товары за коины"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const filter = { userId: interaction.user.id };
      const { coins } = await profileSchema.findOne(filter);

      const shopEmbed = new EmbedBuilder()
        .setTitle(`Магазин товаров ${interaction.member.guild.name}`)
        .setThumbnail(interaction.guild.iconURL())
        .addFields(
          { name: ":star: - Роли", value: "Роли с неограниченым сроком действия" },
          { name: ":dollar: Баланс", value: `${coins} :coin:`} 
        )
        
      await interaction.editReply({ embeds: [shopEmbed] });
    } catch(err) {
      console.log(err);
    }
  }
}