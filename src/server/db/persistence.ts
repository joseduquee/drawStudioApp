import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "documents.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({}, null, 2), "utf8");
  }
}

export async function readById(id: string): Promise<unknown | null> {
  await ensureFiles();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const db = raw ? JSON.parse(raw) as Record<string, unknown> : {};
  return (db[id] ?? null);
}

export async function writeById(id: string, store: unknown): Promise<void> {
  await ensureFiles();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const db = raw ? JSON.parse(raw) as Record<string, unknown> : {};
  db[id] = store ?? {};
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}
