import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 同样用绝对路径定位数据库
const dbPath = path.resolve(__dirname, "../public/pp.db");

async function getDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export default async function handler(req, res) {
  try {
    const db = await getDB();
    const rows = await db.all(
      'SELECT name, score, free, evisa, visa FROM "rank"'
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error in /api/rankings:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}
