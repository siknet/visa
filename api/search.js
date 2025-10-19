import sqlite3 from "sqlite3";
import { open } from "sqlite";
import pinyin from "pinyin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 用绝对路径解析数据库文件
// vercel 会把代码部署到 /var/task，所以我们定位 public 目录下的 pp.db
const dbPath = path.resolve(__dirname, "../public/pp.db");

async function getDB() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

export default async function handler(req, res) {
  try {
    const term = (req.query.term || "").toLowerCase();
    if (!term) return res.status(200).json([]);

    const db = await getDB();
    const all = await db.all("SELECT chn, eng, poli FROM passport");

    const results = [];
    for (const row of all) {
      const chn = row.chn;
      const eng = row.eng.toLowerCase();
      const pinyinFull = pinyin(chn, { style: pinyin.STYLE_NORMAL })
        .flat()
        .join("")
        .toLowerCase();
      const pinyinInitials = pinyin(chn, { style: pinyin.STYLE_FIRST_LETTER })
        .flat()
        .join("")
        .toLowerCase();

      if (
        chn.includes(term) ||
        eng.includes(term) ||
        pinyinFull.includes(term) ||
        pinyinInitials.includes(term)
      ) {
        results.push(row);
        if (results.length >= 10) break;
      }
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error in /api/search:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}
