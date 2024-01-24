import voiceSchema from "../schema/voiceSchema.js";

class VoiceService {
  async create(userId, voiceId) {
    await voiceSchema.create({ userId, voiceId });
  }

  async getOne(userId) {
    const room = await voiceSchema.findOne({ userId });
    return room;
  }

  async deleteOne(userId) {
    await voiceSchema.deleteOne({ userId });
  }

  async isRoomExists(userId) {
    const room = await this.getOne(userId);
    return room ? true : false;
  }
}

export default new VoiceService;