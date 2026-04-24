import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, rootDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${nanoid(8)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    return cb(null, true);
  }
  return cb(new Error("Only image uploads are allowed"), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 4 * 1024 * 1024 } });
export { rootDir as uploadRootDir };
