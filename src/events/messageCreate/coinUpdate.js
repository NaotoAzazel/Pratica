import { getJSONData } from "../../utils.js";
import UserService from "../../service/UserService.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    const { blacklistChannelIds, coinsPerAction } = getJSONData("globalVariables.json");
    const blacklistChannels = new Set(blacklistChannelIds);
    if(blacklistChannels.has(message.channel.id) || message.author.bot || message.type == 7) return;

    try {
      const authorId = message.author.id;
      const isUserExist = await UserService.isUserExist(authorId);

      if(!isUserExist) await UserService.create(authorId, coinsPerAction);
      else await UserService.updateBalanceById(authorId, coinsPerAction, "increment");
    } catch(err) {
      console.log("Error while fetching/updating user data", err);
    }
  }
}