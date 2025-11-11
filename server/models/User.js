const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // no two users can use the same email
  },
  password: {
    type: String,
    required: true, // hashed password will be stored
  },
  role: {
    type: String,
    enum: ["tenant", "landlord"], // allowed roles
    default: "tenant",
  },
});

module.exports = mongoose.model("User", userSchema);
