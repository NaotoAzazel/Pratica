import profileSchema from "../schema/profileSchema.js";

export default new class UserService {
  async create(userId, coins = 0, totalCoinsEarned = 0.5, totalCoinsSpent = 0) {
    if(!userId) throw new Error("No user id specified");
    await profileSchema.create({ userId, coins, totalCoinsEarned, totalCoinsSpent });
  }

  async getBalanceById(userId) {
    const fetchedUser = await profileSchema.findOne({ userId });
    return fetchedUser?.coins;
  }

  async getStatisticsById(userId) {
    const fetchedUser = await profileSchema.findOne({ userId });
    const { totalCoinsEarned, totalCoinsSpent } = fetchedUser || {};
    return { totalCoinsEarned, totalCoinsSpent };
  }

  async getUsersSortedByCoins() {
    const users = await profileSchema
      .find()
      .sort({ coins: -1 })
      .catch((err) => { throw new Error("Error while fetching all users") });

    return users;
  }

  async updateBalanceById(id, amount, operationType) {
    if (!id || !amount || !operationType) {
      throw new Error("Missing required parameters");
    }
  
    const filter = { userId: id };
    const updateOptions = {
      increment: { $inc: { coins: amount, totalCoinsEarned: amount } },
      decrement: { $inc: { coins: -amount, totalCoinsSpent: amount } },
      set: { coins: amount, totalCoinsEarned: amount },
    };
  
    const update = updateOptions[operationType];
  
    if (!update) {
      throw new Error('Invalid operation type');
    }
  
    await profileSchema.findOneAndUpdate(filter, update, { new: true });
  }

  async isUserExist(userId) {
    const fetchedUser = await profileSchema.findOne({ userId });
    return fetchedUser ? true : false;
  }
}