import UserController from "../../controller/UserController.js";

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    if(!interaction.isChatInputCommand()) return;

    try {
      const isUserExist = await UserController.isUserExist(interaction.user.id);
      if(!isUserExist) {
        return await interaction.reply({ content: "Не удалось найти записей вашого профиля. Пожалуйста, отправьте сообщение в любой чат для регистрации профиля", ephemeral: true })
      }
    } catch(err) {
      console.error(`Error in interactionCreate event: ${err.message}`);
    }

    const command = client.commands.get(interaction.commandName);
    if(!command) {
      interaction.reply({ content: "Комманда не найдена", ephemeral: true })
    }

    command.execute(interaction, client);
  },
};