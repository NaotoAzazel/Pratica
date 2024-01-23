import UserController from "../../controller/UserController.js";

export default {
  name: "guildMemberAdd",
  async execute(member) {
    if(member?.user?.bot) return;

    try {
      const isUserExist = await UserController.isUserExist(member?.user?.id);
      if(isUserExist) return;
      else await UserController.create(member?.user?.id);
    } catch (err) {
      console.error(`Error in guildMemberAdd event: ${err.message}`);
    }
  }
}