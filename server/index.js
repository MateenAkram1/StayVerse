import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, ".env") });
dotenv.config({ path: path.join(here, "..", ".env") });
import { createServer } from "http";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";
import { logger } from "./src/utils/logger.js";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const server = createServer(app);
    server.listen(PORT, () => {
      logger(`StayVerse API on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Server failed to start", err);
    process.exit(1);
  }
}

start();
