export default {
  name: "interactionCreate",
  execute(interaction, client) {
    if(!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) {
      interaction.reply({ content: "Комманда не найдена", ephemeral: true })
    }

    command.execute(interaction, client);
  },
};