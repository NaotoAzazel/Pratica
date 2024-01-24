import { getJSONData } from "../../utils.js";
import UserController from "../../controller/UserController.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    const { blacklistChannelIds, coinsPerAction } = getJSONData("globalVariables.json");
    const blacklistChannels = new Set(blacklistChannelIds);
    if(blacklistChannels.has(message.channel.id) || message.author.bot || message.type == 7) return;

    try {
      const authorId = message.author.id;
      const isUserExist = await UserController.isUserExist(authorId);

      if(!isUserExist) await UserController.create(authorId, coinsPerAction);
      else await UserController.updateBalanceById(authorId, coinsPerAction, "increment");
    } catch(err) {
      console.error("Error while fetching/updating user data", err.message);
    }
  }
}