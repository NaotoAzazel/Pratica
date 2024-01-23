import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    require: true,
    unique: true
  },
  coins: {
    type: Number,
    require: true,
    default: 0
  }
});

export default mongoose.model("users", profileSchema);