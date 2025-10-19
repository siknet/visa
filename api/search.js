import sqlite3 from "sqlite3";
import { open } from "sqlite";
import pinyin from "pinyin";

// 获取数据库连接
async function getDB() {
  return open({
    filename: "public/pp.db",
    driver: sqlite3.Database
  });
}

export default async function handler(req, res) {
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
}
