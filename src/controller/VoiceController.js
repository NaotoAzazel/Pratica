import VoiceService from "../service/VoiceService.js";

class VoiceController {
  async create(userId, voiceId) {
    try {
      await VoiceService.create(userId, voiceId);
    } catch(err) {
      throw err;
    }
  }

  async getOne(userId) {
    try {
      return await VoiceService.getOne(userId);
    } catch(err) {
      throw err;
    }
  }

  async deleteOne(userId) {
    try {
      await VoiceService.deleteOne(userId); 
    } catch(err) {
      throw err;
    }
  }

  async isRoomExists(userId) {
    try {
      return await VoiceService.isRoomExists(userId);
    } catch(err) {
      throw err;
    } 
  }
}

export default new VoiceController;