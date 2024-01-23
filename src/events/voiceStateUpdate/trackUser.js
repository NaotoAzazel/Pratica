import { getJSONData } from "../../utils.js";
import UserController from "../../controller/UserController.js";

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
        try {
          const startTime = userInVoiceChannelMap.get(userId).startTime;
          const endTime = Date.now();
          const timeInVoiceChannelInSeconds = (endTime - startTime) / 1000;
  
          const coinsEarned = timeInVoiceChannelInSeconds * coinsPerSecondinVoice;
          const isUserExists = await UserController.isUserExist(userId);
  
          if(!isUserExists) {
            await UserController.create(userId);
          }
  
          await UserController.updateBalanceById(userId, Math.round(coinsEarned), "increment");
          userInVoiceChannelMap.delete(userId);
        } catch(err) {
          console.error("Error in voiceStateUpdate event:", err.message);
        }
      }
    }
  }
}