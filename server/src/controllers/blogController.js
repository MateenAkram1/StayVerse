import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { Blog } from "../models/Blog.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/AppError.js";

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

async function findBlogByIdOrSlug(identifier) {
  if (mongoose.isValidObjectId(identifier)) {
    return Blog.findById(identifier);
  }
  return Blog.findOne({ slug: identifier });
}

export const listBlogs = catchAsync(async (req, res) => {
  const { q, category, page = 1, limit = 10 } = req.query;
  const filter = { published: true };
  if (category) {
    filter.category = category;
  }
  if (q) {
    filter.$or = [
      { title: new RegExp(String(q), "i") },
      { excerpt: new RegExp(String(q), "i") },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("author", "name avatar");
  const total = await Blog.countDocuments(filter);
  res.json({ success: true, blogs, total, page: Number(page) });
});

export const getBlog = catchAsync(async (req, res) => {
  const b = await findBlogByIdOrSlug(req.params.id);
  if (!b) {
    throw new AppError("Post not found", 404);
  }
  const isOwner = req.user && String(b.author) === String(req.user._id);
  const isAdmin = req.user?.role === "admin";
  if (!b.published && !isOwner && !isAdmin) {
    throw new AppError("Post not found", 404);
  }
  b.views = (b.views || 0) + 1;
  await b.save();
  await b.populate("author", "name bio avatar");
  res.json({ success: true, blog: b });
});

export const createBlog = catchAsync(async (req, res) => {
  if (!["host", "admin"].includes(req.user.role)) {
    throw new AppError("Only hosts or administrators can create posts", 403);
  }
  const { title, content, category, excerpt, coverImage, published } = req.body;
  if (!title || !content) {
    throw new AppError("Title and content are required", 400);
  }
  let slug = slugify(title) || `post-${nanoid(6)}`;
  const existing = await Blog.findOne({ slug });
  if (existing) {
    slug = `${slug}-${nanoid(4)}`;
  }
  const blog = await Blog.create({
    title,
    slug,
    content,
    category: category || "Travel",
    excerpt: excerpt || "",
    coverImage: coverImage || "",
    author: req.user._id,
    published: published !== false,
  });
  res.status(201).json({ success: true, blog });
});

export const updateBlog = catchAsync(async (req, res) => {
  const b = await Blog.findById(req.params.id);
  if (!b) throw new AppError("Post not found", 404);
  if (String(b.author) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("Not allowed to edit this post", 403);
  }
  const { title, content, category, excerpt, coverImage, published } = req.body;
  if (title) b.title = title;
  if (content) b.content = content;
  if (category) b.category = category;
  if (excerpt != null) b.excerpt = excerpt;
  if (coverImage != null) b.coverImage = coverImage;
  if (published != null) b.published = published;
  await b.save();
  res.json({ success: true, blog: b });
});

export const deleteBlog = catchAsync(async (req, res) => {
  const b = await Blog.findById(req.params.id);
  if (!b) throw new AppError("Post not found", 404);
  if (String(b.author) !== String(req.user._id) && req.user.role !== "admin") {
    throw new AppError("Not allowed", 403);
  }
  await b.deleteOne();
  res.json({ success: true, message: "Post deleted" });
});

export const myBlogs = catchAsync(async (req, res) => {
  const list = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, blogs: list });
});

export const allCategories = catchAsync(async (_req, res) => {
  const raw = await Blog.distinct("category", { published: true });
  res.json({ success: true, categories: raw });
});
