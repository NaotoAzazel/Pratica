import profileSchema from "../schema/profileSchema.js";

export default new class UserService {
  async create(userId, coins = 0) {
    if(!userId) throw new Error("No user id specified");
    await profileSchema.create({ userId, coins });
  }

  async getBalanceById(userId) {
    const fetchedUser = await profileSchema.findOne({ userId });
    return fetchedUser?.coins;
  }

  async getUsersSortedByCoins() {
    const users = await profileSchema
      .find()
      .sort({ coins: -1 })
      .catch((err) => { throw new Error("Error while fetching all users") });

    return users;
  }

  async updateBalanceById(id, amount, operationType) {
    const filter = { userId: id };

    let update;
    switch(operationType) {
      case "increment": update = { $inc: { coins: amount } }; break;
      case "decrement": update = { $inc: { coins: -amount } }; break;
      case "set": update = { coins: amount }; break;
      default: throw new Error('Invalid operation type');
    }

    await profileSchema.findOneAndUpdate(filter, update, { new: true });
  }

  async isUserExist(userId) {
    const fetchedUser = await profileSchema.findOne({ userId });
    return fetchedUser ? true : false;
  }
}