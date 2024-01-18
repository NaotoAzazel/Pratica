import UserService from "../../service/UserService.js";

export default {
  name: "guildMemberAdd",
  async execute(member) {
    if(member?.user?.bot) return;

    if(await UserService.isUserExist(member?.user?.id)) return;
    else await UserService.create(member?.user?.id);
  }
}