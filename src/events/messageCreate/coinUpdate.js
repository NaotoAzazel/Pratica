import { getJSONData } from "../../utils.js";
import UserService from "../../service/userService.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    const { channelIds } = getJSONData("blacklistChannels.json");
    const blacklistChannels = new Set(channelIds);
    if(blacklistChannels.has(message.channel.id) || message.author.bot || message.type == 7) return;

    try {
      const authorId = message.author.id;
      const isUserExist = await UserService.isUserExist(authorId);

      if(!isUserExist) await UserService.create(authorId);
      else await UserService.updateBalanceById(authorId, 0.5, "increment");
    } catch(err) {
      console.log("Error while fetching/updating user data", err);
    }
  }
}