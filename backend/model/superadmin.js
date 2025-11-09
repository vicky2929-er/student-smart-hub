const mongoose = require("mongoose");

const superAdminSchema = new mongoose.Schema(
  {
    name: {
      first: { type: String, required: true },
      last: { type: String },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    contactNumber: String,
    permissions: {
      type: [String],
      default: ["full_access"],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SuperAdmin", superAdminSchema);
