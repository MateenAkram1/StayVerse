import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "", maxlength: 500 },
    content: { type: String, required: true },
    category: { type: String, default: "General", index: true },
    coverImage: { type: String, default: "" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    published: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", content: "text" });

export const Blog = mongoose.model("Blog", blogSchema);
