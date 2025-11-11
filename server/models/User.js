const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["tenant", "landlord"],
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // tenant signup pending landlord approval
    },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("User", userSchema);
