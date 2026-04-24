import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: true },
    role: { type: String, enum: ["guest", "host", "admin"], default: "guest" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 2000 },
    avatar: { type: String, default: "" },
    social: {
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    locationCity: { type: String, default: "" },
    preferences: {
      maxPrice: { type: Number, default: 500 },
      propertyTypes: [{ type: String }],
    },
    passwordResetToken: { type: String, select: false },
    passwordResetExpire: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const o = this.toObject();
  delete o.password;
  delete o.passwordResetToken;
  delete o.passwordResetExpire;
  return o;
};

export const User = mongoose.model("User", userSchema);
