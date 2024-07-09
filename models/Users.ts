import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
  accountAddress: {
    type: String,
    required: true,
    unique: true,
  },

  tokens: {
    type: [String],
  },
});

export default mongoose.model("Users", UsersSchema);
