import profileSchema from "../../schema/profileSchema.js";
import { getJSONData } from "../../utils.js";

export default {
  name: "messageCreate",
  once: false,
  async execute(message) {
    const { channelIds } = getJSONData("blacklistChannels.json");
    const blacklistChannels = new Set(channelIds);
    if(blacklistChannels.has(message.channel.id) || message.author.bot) return;

    try {
      const authorId = String(message.author.id);
      const fetchedProfileData = await profileSchema.findOne({ userId: authorId });

      if(!fetchedProfileData) {
        await profileSchema.create({ userId: authorId });
      } else {
        const filter = { userId: authorId };
        const update = { $inc: { coins: 0.5 } };

        await profileSchema.findOneAndUpdate(filter, update, { new: true });
      }
    } catch(err) {
      console.log("Error while fetching/updating user data", err);
    }
  }
}