import "server-only";
import fs from "node:fs";
import path from "node:path";
import { CARE, COUPON_SEED, REVIEW_NAMES, REVIEW_POOL, SEED_PRODUCTS, SIZES } from "./catalog-seed";
import { hashStr } from "./utils";

/**
 * Local SQL database using Node's built-in SQLite (node:sqlite, Node >= 22.13).
 * The repository layer (repo.ts) is the only code that talks SQL, so moving to
 * Supabase/Postgres later means re-implementing those functions, not the UI.
 * See supabase/schema.sql for the equivalent Postgres schema.
 */
export interface Stmt {
  all(...p: unknown[]): Record<string, any>[];
  get(...p: unknown[]): Record<string, any> | undefined;
  run(...p: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}
export interface DB {
  exec(sql: string): void;
  prepare(sql: string): Stmt;
}

const g = globalThis as unknown as { __mn_db?: DB };

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, subtitle TEXT NOT NULL DEFAULT '',
  gender TEXT NOT NULL, category TEXT NOT NULL, style TEXT NOT NULL, kind TEXT NOT NULL, season TEXT NOT NULL DEFAULT 'core',
  price INTEGER NOT NULL, mrp INTEGER NOT NULL,
  is_new INTEGER NOT NULL DEFAULT 0, is_bestseller INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '', fabric TEXT NOT NULL DEFAULT '', fit TEXT NOT NULL DEFAULT '',
  care TEXT NOT NULL DEFAULT '[]', details TEXT NOT NULL DEFAULT '[]',
  colors TEXT NOT NULL DEFAULT '[]', sizes TEXT NOT NULL DEFAULT '[]', size_guide TEXT NOT NULL DEFAULT 'one',
  images TEXT NOT NULL DEFAULT '{}',
  rating REAL NOT NULL DEFAULT 0, rating_count INTEGER NOT NULL DEFAULT 0, popularity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color TEXT NOT NULL, size TEXT NOT NULL, stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE (product_id, color, size)
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, phone TEXT,
  password_hash TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS wishlist (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL, PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author TEXT NOT NULL, city TEXT NOT NULL DEFAULT '', rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL, body TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0, is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL, UNIQUE (product_id, user_id)
);
CREATE TABLE IF NOT EXISTS coupons (
  code TEXT PRIMARY KEY COLLATE NOCASE, type TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 0,
  min_subtotal INTEGER NOT NULL DEFAULT 0, max_discount INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1, expires_at TEXT
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL, phone TEXT NOT NULL,
  status TEXT NOT NULL, payment_method TEXT NOT NULL, payment_status TEXT NOT NULL,
  razorpay_order_id TEXT, razorpay_payment_id TEXT,
  subtotal INTEGER NOT NULL, discount INTEGER NOT NULL, shipping INTEGER NOT NULL, cod_fee INTEGER NOT NULL, total INTEGER NOT NULL,
  coupon_code TEXT, address TEXT NOT NULL, created_at TEXT NOT NULL, paid_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_rzp ON orders(razorpay_order_id);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL, slug TEXT NOT NULL, name TEXT NOT NULL, kind TEXT NOT NULL,
  color TEXT NOT NULL, color_hex TEXT NOT NULL, size TEXT NOT NULL, qty INTEGER NOT NULL, price INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY COLLATE NOCASE, created_at TEXT NOT NULL);
`;

export function db(): DB {
  if (g.__mn_db) return g.__mn_db;
  const sqlite = (process as unknown as { getBuiltinModule(id: string): any }).getBuiltinModule("node:sqlite");
  if (!sqlite) throw new Error("node:sqlite is unavailable. Use Node.js 22.13 or newer.");
  const dir = path.resolve(process.env.DATABASE_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "data"));
  fs.mkdirSync(dir, { recursive: true });
  const d: DB = new sqlite.DatabaseSync(path.join(dir, "store.db"));
  d.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  d.exec(SCHEMA);
  seedIfEmpty(d);
  g.__mn_db = d;
  return d;
}

export function tx<T>(fn: (d: DB) => T): T {
  const d = db();
  d.exec("BEGIN IMMEDIATE");
  try {
    const r = fn(d);
    d.exec("COMMIT");
    return r;
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

function stockFor(slug: string, color: string, size: string): number {
  const h = hashStr(`${slug}|${color}|${size}`) % 100;
  if (h < 8) return 0; // some sold-out variants so availability is real
  if (h < 22) return 1 + (h % 4); // low stock
  return 6 + (h % 20);
}

function seedIfEmpty(d: DB) {
  d.exec("BEGIN IMMEDIATE");
  try {
    const done = d.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
    if (done) {
      d.exec("COMMIT");
      return;
    }
    const now = Date.now();
    const insP = d.prepare(`INSERT INTO products
      (slug,name,subtitle,gender,category,style,kind,season,price,mrp,is_new,is_bestseller,description,fabric,fit,care,details,colors,sizes,size_guide,images,popularity,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
    const insV = d.prepare("INSERT INTO variants (product_id,color,size,stock) VALUES (?,?,?,?)");
    const insR = d.prepare(`INSERT INTO reviews (product_id,user_id,author,city,rating,title,body,verified,is_sample,created_at)
      VALUES (?,NULL,?,?,?,?,?,1,1,?)`);
    const updRating = d.prepare("UPDATE products SET rating = ?, rating_count = ? WHERE id = ?");
    const RATINGS = [5, 5, 5, 4, 4, 4, 5, 3, 5, 4];

    for (const p of SEED_PRODUCTS) {
      const colors = p.colors.map(([name, hex]) => ({ name, hex }));
      const sizes = [...SIZES[p.sizes]];
      const res = insP.run(
        p.slug, p.name, p.subtitle, p.gender, p.category, p.style, p.kind, p.season,
        p.price, p.mrp ?? p.price, p.isNew ? 1 : 0, p.best ? 1 : 0,
        p.description, p.fabric, p.fit, JSON.stringify(CARE[p.care]), JSON.stringify(p.details),
        JSON.stringify(colors), JSON.stringify(sizes), p.sizeGuide, "{}", p.popularity,
        new Date(now - p.daysAgo * 86400000).toISOString(),
      );
      const pid = Number(res.lastInsertRowid);
      for (const c of colors) for (const s of sizes) insV.run(pid, c.name, s, stockFor(p.slug, c.name, s));

      const n = 3 + (hashStr(p.slug) % 4) + (p.popularity > 90 ? 2 : 0);
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const h = hashStr(`${p.slug}-${i}`);
        const [author, city] = REVIEW_NAMES[h % REVIEW_NAMES.length];
        const [title, body] = REVIEW_POOL[(h >>> 3) % REVIEW_POOL.length];
        const rating = RATINGS[(h >>> 5) % RATINGS.length];
        sum += rating;
        insR.run(pid, author, city, rating, title, body, new Date(now - (5 + (h % 190)) * 86400000).toISOString());
      }
      updRating.run(Math.round((sum / n) * 10) / 10, n, pid);
    }

    const insC = d.prepare("INSERT INTO coupons (code,type,value,min_subtotal,max_discount,description,active,expires_at) VALUES (?,?,?,?,?,?,1,?)");
    for (const c of COUPON_SEED) insC.run(c.code, c.type, c.value, c.min, c.max, c.description, c.expires);

    d.prepare("INSERT INTO meta (key,value) VALUES ('seeded', ?)").run(new Date().toISOString());
    d.exec("COMMIT");
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}
