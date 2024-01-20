import { getJSONData } from "../../utils.js";
import UserService from "../../service/UserService.js";

const userInVoiceChannelMap = new Map();

export default {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldState, newState) {
    const { coinsPerSecondinVoice } = getJSONData("globalVariables.json");
    const userId = newState.member.id;
    
    const { channelId: oldChannelId } = oldState;
    const { channelId: newChannelId } = newState;

    if (newChannelId && !oldChannelId) {
      if (!userInVoiceChannelMap.has(userId)) {
        userInVoiceChannelMap.set(userId, { startTime: Date.now() });
      }
    }
  
    if (!newChannelId && oldChannelId) {
      if (userInVoiceChannelMap.has(userId)) {
        const startTime = userInVoiceChannelMap.get(userId).startTime;
        const endTime = Date.now();
        const timeInVoiceChannelInSeconds = (endTime - startTime) / 1000;

        const coinsEarned = timeInVoiceChannelInSeconds * coinsPerSecondinVoice;
        const isUserExists = await UserService.isUserExist(userId);

        if(!isUserExists) {
          await UserService.create(userId);
        }

        await UserService.updateBalanceById(userId, coinsEarned, "increment");

        userInVoiceChannelMap.delete(userId);
      }
    }
  }
}