// Visual QA helper (dev only). Usage: node scripts/shot.mjs <url> <out.png> [width] [height] [--full] [--mobile] [--click=selector] [--eval=js]
// Needs a headless Chromium: npm i @sparticuz/chromium playwright-core in /tmp/pw
import { createRequire } from "node:module";
const require = createRequire("/tmp/pw/");
const chromium = (await import("/tmp/pw/node_modules/@sparticuz/chromium/build/index.js")).default;
const { chromium: pw } = require("playwright-core");
const [url, out, w = "1440", h = "900", ...flags] = process.argv.slice(2);
const flag = (n) => flags.find((f) => f.startsWith(`--${n}=`))?.slice(n.length + 3);
const exe = await chromium.executablePath();
const b = await pw.launch({ executablePath: exe, args: chromium.args, headless: true });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: flags.includes("--mobile"), isMobile: flags.includes("--mobile") });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) errors.push(`[${m.type()}] ${m.text().slice(0, 400)}`); });
p.on("pageerror", (e) => errors.push("[pageerror] " + e.message.slice(0, 400)));
await p.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => errors.push("goto: " + e.message));
await p.waitForTimeout(1800);
if (flags.includes("--full")) {
  const height = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 450) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(140); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(900);
}
const click = flag("click");
if (click) { await p.click(click, { timeout: 5000 }).catch((e) => errors.push("click: " + e.message.slice(0, 200))); await p.waitForTimeout(1400); }
const ev = flag("eval");
if (ev) { const r = await p.evaluate(ev).catch((e) => "eval error: " + e.message); console.log("eval:", JSON.stringify(r)); await p.waitForTimeout(800); }
await p.screenshot({ path: out, fullPage: flags.includes("--full") });
console.log(errors.length ? errors.join("\n") : "no console errors");
await b.close();
