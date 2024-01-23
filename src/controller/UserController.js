import UserService from "../service/UserService.js";

class UserController { 
  async create(id, coins = 0) {
    try {
      await UserService.create(id, coins);
    } catch(err) {
      throw err;
    }
  }

  async getBalanceById(id) {
    try {
      return await UserService.getBalanceById(id);;
    } catch(err) {
      throw err;
    }
  }

  async getUsersSortedByCoins() {
    try {
      return await UserService.getUsersSortedByCoins();
    } catch(err) {
      throw err;
    }
  }

  /**
   * @param {string} [operationType="increment" || "set" || "decrement"] 
   *  - Тип операции ("increment", "set", "decrement")
  */
  async updateBalanceById(id, amount, operationType) {
    try {
      await UserService.updateBalanceById(id, amount, operationType);
    } catch(err) {
      throw err;
    }
  }

  async isUserExist(id) {
    try {
      return await UserService.isUserExist(id);
    } catch(err) {
      throw err;
    }
  }
}

export default new UserController;