import profileSchema from "../schema/profileSchema.js";

export default new class UserService {
  async create(userId, coins = 0) {
    if(!userId) throw new Error("No user id specified");
    await profileSchema.create({ userId, coins });
  }

  async getBalanceById(id) {
    const filter = { userId: id };
    const fetchedUser = await profileSchema.findOne(filter);

    return fetchedUser?.coins;
  }

  /**
   * @param {string} [operationType='increment'] - Тип операции ("increment", "set", "decrement")
  */
  async updateBalanceById(id, amount, operationType = "increment") {
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

  async isUserExist(id) {
    const filter = { userId: id };
    const fetchedUser = await profileSchema.findOne(filter);

    return fetchedUser || null;
  }
}