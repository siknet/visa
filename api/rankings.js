import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function getDB() {
  return open({
    filename: "../public/pp.db",
    driver: sqlite3.Database
  });
}

export default async function handler(req, res) {
  const db = await getDB();
  const rows = await db.all(
    'SELECT name, score, free, evisa, visa FROM "rank"'
  );
  res.status(200).json(rows);
}

