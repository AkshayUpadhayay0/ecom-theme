import { garmentSvg, garmentViewBox, finishFor } from "../src/lib/garments";
import { SEED_PRODUCTS } from "../src/lib/catalog-seed";
import fs from "node:fs";
const view = Number(process.argv[2] ?? 0);
const out = process.argv[3] ?? "/tmp/sheet.svg";
const seen = new Map<string, any>();
for (const p of SEED_PRODUCTS) if (!seen.has(p.kind)) seen.set(p.kind, p);
const items = [...seen.values()];
const cols = 5, w = 240, h = 300;
let body = "";
items.forEach((p, i) => {
  const x = (i % cols) * w, y = Math.floor(i / cols) * h;
  const uid = "g" + i;
  body += `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${garmentViewBox(p.kind, view)}" preserveAspectRatio="xMidYMid slice">${garmentSvg({ kind: p.kind, color: p.colors[0][1], view, uid, finish: finishFor(p.kind, p.fabric) })}</svg>`;
});
fs.writeFileSync(out, `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * w}" height="${Math.ceil(items.length / cols) * h}">${body}</svg>`);
console.log(items.map((p) => p.kind).join(","));
