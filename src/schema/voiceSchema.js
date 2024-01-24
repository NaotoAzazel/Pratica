import mongoose from "mongoose";

const voiceSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    require: true,
    unique: true
  },
  voiceId: {
    type: String, 
    require: true,
    unique: true
  }
});

export default mongoose.model("voice", voiceSchema);
