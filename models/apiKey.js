// models/ApiKey.js
const mongoose = require("mongoose");
const crypto = require("crypto");

// Define the schema for API keys
const apiKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] },
  userName: { type: String, required: true },
  userPost: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  encryptedKey: { type: String},
  type: { type: String,required: true },
});

// Pre-save hook to hash the key before saving
apiKeySchema.pre("save", function (next) {
  if (this.isModified("key") || this.isNew) {
    this.encryptedKey = crypto
      .createHash("sha256")
      .update(this.key)
      .digest("hex");
  }
  next();
});

// Static method to verify the API key
apiKeySchema.statics.verifyKey = async function (key) {
  const hashedKey = crypto.createHash("sha256").update(key).digest("hex");
  return this.findOne({ encryptedKey: hashedKey });
};

const ApiKey = mongoose.model("ApiKey", apiKeySchema);

module.exports = ApiKey;
