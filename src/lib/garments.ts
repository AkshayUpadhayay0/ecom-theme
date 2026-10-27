/**
 * Generates tonal, editorial-style garment artwork as SVG markup. It is used when a product has no
 * photography yet, so every product page still looks intentional. Real photos (product.images)
 * always take priority — see components/product-image.tsx.
 *
 * Pure string output so it can run on the server, in the browser and in scripts.
 */
import type { ArtKind } from "./types";

type Pt = [number, number];
export type Finish = "weave" | "rib" | "twill" | "satin" | "leather";

/* ---------- colour helpers ---------- */
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
}
const toHex = (c: number[]) => "#" + c.map((v) => clamp(v).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => {
  const x = rgb(a), y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
export const luminance = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function finishFor(kind: ArtKind, fabric = ""): Finish {
  const f = fabric.toLowerCase();
  if (f.includes("leather")) return "leather";
  if (f.includes("denim")) return "twill";
  if (f.includes("satin")) return "satin";
  if (kind === "knit" || kind === "cardigan" || kind === "scarf" || f.includes("merino") || f.includes("knit") || f.includes("rib")) return "rib";
  if (kind === "tote" || kind === "belt" || kind === "sneaker") return "leather";
  if (kind === "jeans") return "twill";
  return "weave";
}

/* ---------- geometry helpers ---------- */
/** Mirrors a right-hand outline (top-centre to bottom-centre) into a closed symmetric path. */
function sym(half: Pt[]): string {
  const right = half.map(([dx, y]) => [200 + dx, y]);
  const left = [...half].reverse().map(([dx, y]) => [200 - dx, y]);
  return "M" + [...right, ...left].map((p) => p.join(" ")).join(" L") + " Z";
}
const m = (x: number) => 400 - x; // mirror an x coordinate about the centre line
const f1 = (n: number) => Math.round(n * 10) / 10;

interface Pal { base: string; dark: string; deep: string; light: string; seam: string; hi: string }

interface Art {
  shape: string; // path(s) without fill, painted with the garment colour
  details: string; // fully styled extras (seams, pockets, buttons)
  focus: Pt; // centre of the "detail" crop
  y0: number; // top of the artwork (for auto-framing)
  hw: number; // half width of the artwork (for auto-framing)
  shadowY: number;
  shadowW: number;
  extraBehind?: string; // painted before the shape (e.g. hoods, handles)
}

const line = (d: string, p: Pal, w = 1.6, dash = "") =>
  `<path d="${d}" fill="none" stroke="${p.seam}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const hi = (d: string, p: Pal, w = 1.4) =>
  `<path d="${d}" fill="none" stroke="${p.hi}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (x: number, y: number, r: number, p: Pal) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.deep}" opacity=".85"/><circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${r * 0.38}" fill="${p.hi}"/>`;
const both = (fn: (x: (v: number) => number) => string) => fn((v) => v) + fn(m);

/* ---------- tops ---------- */
interface TopOpts {
  neckW: number; neckY: number; shoulder: number; shoulderY: number;
  sleeve: "short" | "long"; body: number; hemY: number; hemDx?: number;
  neck: "crew" | "collar" | "lapel" | "hood" | "v";
  detail: "none" | "buttons" | "zip" | "blazer" | "coat" | "knit" | "cardigan" | "sweat";
  pockets?: "flap" | "kangaroo" | "chest" | "welt" | "none";
  back?: boolean;
}

function top(o: TopOpts, p: Pal): Art {
  const hemDx = o.hemDx ?? o.body;
  const sy = o.shoulderY;
  const half: Pt[] = [[o.neckW, o.neckY], [o.shoulder, sy]];
  let underY: number;
  if (o.sleeve === "short") {
    half.push([o.shoulder + 70, sy + 50], [o.shoulder + 52, sy + 106]);
    underY = sy + 86;
  } else {
    half.push([o.shoulder + 58, sy + 44], [o.shoulder + 74, sy + 262], [o.shoulder + 38, sy + 268]);
    underY = sy + 104;
  }
  half.push([o.body, underY], [hemDx, o.hemY], [0, o.hemY]);
  let d = "";
  const shape = sym(half);

  // sleeve seams
  const sx = 200 + o.shoulder, ux = 200 + o.body;
  d += line(`M${sx} ${sy} L${ux} ${underY}`, p) + line(`M${m(sx)} ${sy} L${m(ux)} ${underY}`, p);

  const nY = o.neckY;
  const back = !!o.back;
  const neckInner = (depth: number, w = o.neckW) =>
    `<path d="M${200 - w} ${nY} Q200 ${nY + depth} ${200 + w} ${nY} Z" fill="${p.deep}"/>`;
  let behind = "";

  if (o.neck === "crew") {
    d += neckInner(back ? 12 : 52);
    d += `<path d="M${200 - o.neckW - 2} ${nY - 1} Q200 ${nY + (back ? 18 : 60)} ${200 + o.neckW + 2} ${nY - 1}" fill="none" stroke="${p.dark}" stroke-width="7" stroke-linecap="round"/>`;
    d += hi(`M${200 - o.neckW} ${nY + 4} Q200 ${nY + (back ? 14 : 56)} ${200 + o.neckW} ${nY + 4}`, p, 1);
  } else if (o.neck === "v") {
    d += `<path d="M${200 - o.neckW} ${nY} L200 ${nY + (back ? 14 : 78)} L${200 + o.neckW} ${nY} Z" fill="${p.deep}"/>`;
    d += line(`M${200 - o.neckW - 2} ${nY} L200 ${nY + (back ? 16 : 82)} L${200 + o.neckW + 2} ${nY}`, p, 5);
  } else if (o.neck === "collar") {
    d += neckInner(back ? 10 : 30, o.neckW - 6);
    for (const mir of [false, true]) {
      const X = (v: number) => (mir ? m(v) : v);
      const pts = back
        ? `${X(200 + 4)},${nY - 4} ${X(200 + o.neckW + 8)},${nY - 6} ${X(200 + o.neckW + 26)},${nY + 30} ${X(200 + 6)},${nY + 22}`
        : `${X(200 + 4)},${nY + 36} ${X(200 + o.neckW + 2)},${nY - 8} ${X(200 + o.neckW + 30)},${nY + 40} ${X(200 + 12)},${nY + 62}`;
      d += `<polygon points="${pts}" fill="${p.light}" stroke="${p.seam}" stroke-width="1.4" stroke-linejoin="round"/>`;
    }
  } else if (o.neck === "lapel") {
    if (!back) {
      d += `<path d="M${200 - o.neckW} ${nY} L200 ${nY + 190} L${200 + o.neckW} ${nY} Z" fill="${p.deep}"/>`;
      for (const mir of [false, true]) {
        const X = (v: number) => (mir ? m(v) : v);
        const pts = `${X(200 + 6)},${nY + 196} ${X(200 + 54)},${nY + 92} ${X(200 + o.neckW + 22)},${nY + 14} ${X(200 + o.neckW + 4)},${nY - 6} ${X(200 + 22)},${nY + 8}`;
        d += `<polygon points="${pts}" fill="${p.light}" stroke="${p.seam}" stroke-width="1.5" stroke-linejoin="round"/>`;
        d += line(`M${X(200 + 54)} ${nY + 92} L${X(200 + o.neckW + 22)} ${nY + 14}`, p, 1.2);
      }
    } else {
      d += neckInner(10, o.neckW - 4);
      d += line(`M200 ${nY + 8} V${o.hemY - 10}`, p, 1.4);
    }
  } else if (o.neck === "hood") {
    behind += `<path d="M${200 - o.neckW - 26} ${nY + 18} Q${200 - o.neckW - 30} ${nY - 56} 200 ${nY - 58} Q${200 + o.neckW + 30} ${nY - 56} ${200 + o.neckW + 26} ${nY + 18} Q${200 + o.neckW + 4} ${nY + 70} 200 ${nY + 74} Q${200 - o.neckW - 4} ${nY + 70} ${200 - o.neckW - 26} ${nY + 18} Z" fill="${p.base}"/>`;
    if (!back) {
      d += `<path d="M${200 - o.neckW - 10} ${nY + 8} Q200 ${nY + 90} ${200 + o.neckW + 10} ${nY + 8} Q${200 + o.neckW} ${nY - 40} 200 ${nY - 42} Q${200 - o.neckW} ${nY - 40} ${200 - o.neckW - 10} ${nY + 8} Z" fill="${p.deep}"/>`;
      d += line(`M${200 - o.neckW - 12} ${nY + 10} Q200 ${nY + 94} ${200 + o.neckW + 12} ${nY + 10}`, p, 3);
    } else d += line(`M200 ${nY - 44} V${nY + 40}`, p, 1.4);
  }

  if (!back) {
    const cy = o.hemY;
    switch (o.detail) {
      case "buttons":
        d += line(`M200 ${nY + 62} V${cy - 6}`, p, 1.4);
        for (let y = nY + 86; y < cy - 20; y += 52) d += dot(200, y, 4.4, p);
        if (o.pockets === "chest") d += line(`M232 ${sy + 56} h38 v40 l-19 8 l-19 -8 z`, p, 1.4);
        if (o.pockets === "flap") {
          d += both((X) => line(`M${X(232)} ${sy + 62} h42 v30 h-42 z`, p, 1.4) + line(`M${X(240)} ${cy - 108} h50 v46 h-50 z`, p, 1.4));
        }
        d += line(`M${200 - hemDx + 6} ${cy - 10} H${200 + hemDx - 6}`, p, 1.2, "4 4");
        break;
      case "zip":
        d += line(`M200 ${nY + 60} V${cy}`, p, 3);
        d += dot(200, nY + 64, 4, p);
        d += both((X) => line(`M${X(214)} ${cy - 108} L${X(256)} ${cy - 70}`, p, 1.5));
        d += both((X) => line(`M${X(120)} ${cy - 24} H${X(168)}`, p, 1.2, "3 4"));
        d += line(`M${200 - hemDx + 2} ${cy - 22} H${200 + hemDx - 2}`, p, 1.4);
        // drawcords
        d += both((X) => line(`M${X(214)} ${nY + 60} v34`, p, 2.4) + dot(X(214), nY + 98, 2.6, p));
        break;
      case "sweat":
        d += line(`M${200 - hemDx} ${cy - 28} H${200 + hemDx}`, p, 1.4);
        break;
      case "blazer":
        d += dot(200, nY + 204, 5, p) + dot(200, nY + 238, 5, p);
        d += both((X) => line(`M${X(238)} ${o.hemY - 86} h46`, p, 1.6) + line(`M${X(238)} ${o.hemY - 86} l0 -4 h46 v4`, p, 1.2));
        d += line(`M200 ${nY + 196} V${cy}`, p, 1.2);
        break;
      case "coat":
        d += line(`M200 ${nY + 190} V${cy}`, p, 1.4);
        for (let y = nY + 230; y < cy - 60; y += 70) d += dot(200, y, 4.6, p);
        d += both((X) => line(`M${X(244)} ${cy - 130} l8 40`, p, 1.6));
        d += line(`M${200 - hemDx + 4} ${cy - 14} H${200 + hemDx - 4}`, p, 1.2, "4 4");
        break;
      case "knit":
        d += line(`M${200 - hemDx} ${cy - 30} H${200 + hemDx}`, p, 1.2);
        d += both((X) => line(`M${X(200 + o.shoulder + 38)} ${sy + 232} l-34 6`, p, 1.2));
        break;
      case "cardigan":
        d += `<path d="M${200 - 14} ${nY + 12} L200 ${nY + 8} L${200 + 14} ${nY + 12} L${200 + 6} ${cy} L${200 - 6} ${cy} Z" fill="${p.deep}" opacity=".9"/>`;
        d += line(`M${200 - 6} ${nY + 14} V${cy}`, p, 1.2) + line(`M${200 + 6} ${nY + 14} V${cy}`, p, 1.2);
        for (let y = nY + 74; y < cy - 30; y += 58) d += dot(200 - 10, y, 4.2, p);
        d += both((X) => line(`M${X(238)} ${cy - 108} h48 v52 h-48 z`, p, 1.3));
        d += line(`M${200 - hemDx} ${cy - 30} H${200 + hemDx}`, p, 1.2);
        break;
      default:
        d += line(`M${200 - hemDx + 6} ${cy - 10} H${200 + hemDx - 6}`, p, 1.2, "4 4");
    }
  }
  return { shape, details: d, extraBehind: behind, focus: [200, o.neckY + 90], y0: o.neck === "hood" ? o.neckY - 62 : o.neckY - 8, hw: o.shoulder + (o.sleeve === "long" ? 76 : 70), shadowY: o.hemY + 16, shadowW: hemDx + 60 };
}

/* ---------- bottoms ---------- */
interface BotOpts {
  waist: number; hip: number; hemOuter: number; hemInner: number; hemY: number; top?: number; crotchY?: number;
  style: "trouser" | "cargo" | "jeans" | "shorts";
  back?: boolean;
}
function bottoms(o: BotOpts, p: Pal): Art {
  const t = o.top ?? 70;
  const cy = o.crotchY ?? 232;
  const shape = sym([[o.waist, t], [o.hip, t + 62], [o.hemOuter, o.hemY], [o.hemInner, o.hemY], [8, cy], [0, cy - 8]]);
  let d = "";
  d += line(`M${200 - o.waist} ${t + 22} H${200 + o.waist}`, p, 1.3);
  for (const x of [-o.waist + 14, o.waist - 14]) d += `<rect x="${200 + x - 4}" y="${t - 1}" width="8" height="${22}" fill="${p.dark}" opacity=".55"/>`;
  if (!o.back) {
    if (o.style === "jeans") {
      d += both((X) => `<path d="M${X(200 - o.waist + 14)} ${t + 24} Q${X(200 - o.waist + 48)} ${t + 96} ${X(200 - 14)} ${t + 70}" fill="none" stroke="#c9a15a" stroke-width="1.5" stroke-dasharray="3 2.5"/>`);
      d += `<path d="M200 ${t + 24} V${t + 92} Q200 ${t + 112} 214 ${t + 108}" fill="none" stroke="#c9a15a" stroke-width="1.5" stroke-dasharray="3 2.5"/>`;
      d += both((X) => dot(X(200 - o.waist + 16), t + 34, 3, p));
      d += both((X) => line(`M${X(200 - o.hemOuter + 3)} ${o.hemY - 14} H${X(200 - o.hemInner - 3)}`, p, 1.4, "4 3"));
    } else if (o.style === "cargo") {
      d += line(`M200 ${t + 24} V${t + 100}`, p, 1.4);
      d += both((X) => line(`M${X(200 - o.waist + 6)} ${t + 30} Q${X(200 - o.hip + 22)} ${t + 70} ${X(200 - o.hip + 26)} ${t + 100}`, p, 1.4));
      d += both((X) => `<rect x="${X(200 - o.hip - 6) - (X(0) === 0 ? 0 : 56)}" y="${t + 150}" width="56" height="74" rx="3" fill="none" stroke="${p.seam}" stroke-width="1.5"/>` + line(`M${X(200 - o.hip - 6) - (X(0) === 0 ? 0 : 56)} ${t + 172} h56`, p, 1.2));
      d += both((X) => line(`M${X(200 - o.hemOuter + 8)} ${o.hemY - 22} H${X(200 - o.hemInner - 8)}`, p, 1.6));
    } else if (o.style === "shorts") {
      d += line(`M200 ${t + 24} V${t + 70}`, p, 1.2);
      d += both((X) => line(`M${X(200 - o.waist + 8)} ${t + 30} Q${X(200 - o.hip + 24)} ${t + 70} ${X(200 - o.hip + 28)} ${t + 106}`, p, 1.4));
      d += `<path d="M${200 - 22} ${t + 24} q22 12 44 0" fill="none" stroke="${p.seam}" stroke-width="2.4" stroke-linecap="round"/>`;
    } else {
      d += line(`M200 ${t + 24} V${cy - 56} Q200 ${cy - 44} 208 ${cy - 40}`, p, 1.3);
      d += both((X) => line(`M${X(200 - o.waist + 4)} ${t + 24} L${X(200 - o.waist + 18)} ${t + 70}`, p, 1.3));
      d += both((X) => line(`M${X(200 - 36)} ${t + 24} V${t + 64}`, p, 1.3));
      d += both((X) => line(`M${X(200 - (o.hemOuter + o.hemInner) / 2)} ${t + 120} V${o.hemY - 4}`, p, 1.1));
    }
    d += dot(200, t + 12, 3.4, p);
  } else {
    d += both((X) => line(`M${X(200 - o.waist + 24)} ${t + 70} h40`, p, 1.5));
  }
  return { shape, details: d, focus: [200, t + 90], y0: t - 4, hw: Math.max(o.hip, o.hemOuter), shadowY: o.hemY + 14, shadowW: o.hemOuter + 50 };
}

/* ---------- other pieces ---------- */
function dress(p: Pal, back: boolean): Art {
  const shape = "M146 112 L254 112 C262 160 252 200 252 214 C262 300 304 400 318 472 C270 486 130 486 82 472 C96 400 138 300 148 214 C148 200 138 160 146 112 Z";
  let d = "";
  d += both((X) => `<path d="M${X(200 - 38)} 112 L${X(200 - 46)} 26" fill="none" stroke="${p.base}" stroke-width="8" stroke-linecap="round"/>`);
  d += both((X) => `<path d="M${X(200 - 38)} 112 L${X(200 - 46)} 26" fill="none" stroke="${p.hi}" stroke-width="1.2" stroke-linecap="round" transform="translate(-2,0)"/>`);
  if (!back) {
    d += `<path d="M142 112 Q200 188 258 112 Z" fill="${p.deep}"/>`;
    d += line("M142 113 Q200 190 258 113", p, 1.6);
    d += line("M200 190 Q196 330 208 468", p, 1);
  } else d += line("M142 112 Q200 130 258 112", p, 1.6) + line("M200 130 V470", p, 1);
  d += both((X) => line(`M${X(200 - 54)} 214 Q${X(200 - 62)} 330 ${X(200 - 100)} 470`, p, 1));
  d += both((X) => line(`M${X(200 + 20)} 372 Q${X(200 + 40)} 420 ${X(200 + 68)} 472`, p, 1.3));
  return { shape, details: d, focus: [200, 150], y0: 22, hw: 122, shadowY: 486, shadowW: 150 };
}

function skirt(p: Pal): Art {
  const shape = sym([[64, 86], [70, 120], [124, 446], [0, 452]]);
  let d = `<rect x="${200 - 66}" y="82" width="132" height="24" fill="${p.dark}" opacity=".5"/>`;
  d += line("M134 106 H266", p, 1.4);
  for (let i = -6; i <= 6; i++) {
    const t = i / 6;
    const x0 = 200 + t * 64, x1 = 200 + t * 124;
    d += line(`M${f1(x0)} 108 L${f1(x1)} 446`, p, i % 2 ? 1.1 : 0.8);
    if (i % 2) d += hi(`M${f1(x0 + 3)} 108 L${f1(x1 + 4)} 446`, p, 1);
  }
  d += dot(222, 94, 3, p);
  return { shape, details: d, focus: [200, 150], y0: 80, hw: 126, shadowY: 462, shadowW: 150 };
}

function tote(p: Pal): Art {
  const behind = `<path d="M146 214 C146 70 254 70 254 214" fill="none" stroke="${p.dark}" stroke-width="13" stroke-linecap="round"/><path d="M146 214 C146 78 254 78 254 214" fill="none" stroke="${p.hi}" stroke-width="1.5"/>`;
  const shape = sym([[132, 204], [148, 440], [0, 446]]);
  let d = line("M76 232 H324", p, 1.4, "5 4") + hi("M72 206 H328", p, 1.6);
  d += `<rect x="176" y="276" width="48" height="30" rx="3" fill="${p.deep}" opacity=".4"/>`;
  d += `<rect x="181" y="281" width="38" height="20" rx="2" fill="none" stroke="${p.hi}" stroke-width="1.2"/>`;
  d += dot(200, 218, 5, p);
  return { shape, details: d, extraBehind: behind, focus: [200, 250], y0: 72, hw: 150, shadowY: 456, shadowW: 170 };
}

function scarf(p: Pal): Art {
  const behind = `<path d="M142 90 C132 20 268 20 258 90" fill="none" stroke="${p.base}" stroke-width="40" stroke-linecap="round"/><path d="M142 90 C132 24 268 24 258 90" fill="none" stroke="${p.hi}" stroke-width="1.6"/>`;
  const shape = "M150 84 L252 84 L262 424 L146 424 Z";
  let d = "";
  for (let x = 152; x < 262; x += 7) d += `<path d="M${x} 424 v28" stroke="${p.base}" stroke-width="3.4" stroke-linecap="round"/>`;
  d += hi("M170 110 L166 424", p, 1.4) + line("M236 110 L240 424", p, 1.4);
  d += `<path d="M150 84 C170 120 230 120 252 84" fill="${p.dark}" opacity=".5"/>`;
  return { shape, details: d, extraBehind: behind, focus: [200, 150], y0: 36, hw: 130, shadowY: 458, shadowW: 120 };
}

function cap(p: Pal): Art {
  const shape = "M92 308 C84 196 168 148 238 164 C282 176 296 236 292 308 Z";
  const brim = `<path d="M258 290 C312 282 376 296 386 316 C352 334 292 332 258 320 Z" fill="${p.dark}"/><path d="M262 296 C318 290 368 302 380 314" fill="none" stroke="${p.hi}" stroke-width="1.4"/>`;
  let d = brim;
  d += `<circle cx="176" cy="160" r="7" fill="${p.dark}"/>`;
  d += line("M176 164 C148 212 140 262 144 308", p, 1.4) + line("M176 164 C208 204 228 254 230 308", p, 1.4);
  d += line("M176 164 C170 220 176 270 190 308", p, 1.1);
  d += `<circle cx="150" cy="214" r="2.6" fill="${p.deep}"/><circle cx="214" cy="204" r="2.6" fill="${p.deep}"/>`;
  d += line("M92 296 H292", p, 1.3, "3 3");
  d += `<rect x="82" y="284" width="20" height="16" rx="3" fill="${p.dark}"/>`;
  d += `<path d="M220 246 l10 -4 l10 4 l-4 10 h-12 z" fill="none" stroke="${p.hi}" stroke-width="1.6" stroke-linejoin="round"/>`;
  return { shape, details: d, extraBehind: "", focus: [200, 240], y0: 150, hw: 150, shadowY: 342, shadowW: 150 };
}

function belt(p: Pal): Art {
  const shape = "M54 232 H352 Q362 232 362 242 V264 Q362 274 352 274 H54 Z";
  let d = `<rect x="46" y="222" width="62" height="62" rx="8" fill="none" stroke="#b9ab94" stroke-width="7"/>`;
  d += `<rect x="46" y="222" width="62" height="62" rx="8" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`;
  d += `<path d="M78 222 V284" stroke="#9c8f7a" stroke-width="6" stroke-linecap="round"/>`;
  for (let x = 196; x <= 316; x += 30) d += `<circle cx="${x}" cy="253" r="5" fill="${p.deep}"/><circle cx="${x - 1}" cy="252" r="2" fill="${p.hi}"/>`;
  d += line("M118 238 H352", p, 1.2, "4 3") + line("M118 268 H352", p, 1.2, "4 3");
  d += `<rect x="116" y="228" width="16" height="36" rx="3" fill="${p.dark}"/>`;
  return { shape, details: d, focus: [190, 254], y0: 218, hw: 190, shadowY: 300, shadowW: 150 };
}

function sneaker(p: Pal): Art {
  const sole = "M52 330 C52 322 60 318 70 318 H342 C354 318 360 326 358 334 C356 346 342 354 328 354 H70 C58 354 52 344 52 330 Z";
  const upper = "M70 320 L66 236 C66 220 78 212 92 216 L132 228 C146 232 158 226 168 214 L186 192 C194 184 206 186 214 192 L234 214 C252 232 292 242 334 268 C350 278 358 300 356 320 Z";
  const behind = `<path d="${sole}" fill="${mix("#f4f1ea", p.base, 0.12)}"/><path d="${sole}" fill="none" stroke="${p.seam}" stroke-width="1.2"/>`;
  let d = `<path d="M52 336 H358" stroke="${p.seam}" stroke-width="1.4"/>`;
  for (let i = 0; i < 4; i++) d += line(`M${186 + i * 14} ${204 + i * 8} l24 -6`, p, 3);
  d += line("M168 214 Q200 240 232 216", p, 1.4);
  d += line("M300 252 Q292 292 336 300", p, 1.6);
  d += line("M72 290 Q112 282 140 316", p, 1.6);
  d += `<path d="M66 236 C66 220 78 212 92 216 L110 222 L104 262 L68 262 Z" fill="${p.dark}" opacity=".6"/>`;
  d += hi("M214 192 L234 214", p, 1.4);
  return { shape: upper, details: d, extraBehind: behind, focus: [210, 250], y0: 182, hw: 170, shadowY: 366, shadowW: 170 };
}

/* ---------- registry ---------- */
function build(kind: ArtKind, p: Pal, back: boolean): Art {
  switch (kind) {
    case "tee": return top({ neckW: 34, neckY: 64, shoulder: 92, shoulderY: 84, sleeve: "short", body: 108, hemY: 396, neck: "crew", detail: "none", back }, p);
    case "sweat": return top({ neckW: 36, neckY: 62, shoulder: 96, shoulderY: 82, sleeve: "long", body: 108, hemY: 404, neck: "crew", detail: "sweat", back }, p);
    case "hoodie": return top({ neckW: 40, neckY: 74, shoulder: 98, shoulderY: 94, sleeve: "long", body: 110, hemY: 414, neck: "hood", detail: "zip", back }, p);
    case "jacket": return top({ neckW: 34, neckY: 60, shoulder: 100, shoulderY: 82, sleeve: "long", body: 114, hemY: 386, neck: "collar", detail: "buttons", pockets: "flap", back }, p);
    case "shirt": return top({ neckW: 30, neckY: 60, shoulder: 96, shoulderY: 80, sleeve: "long", body: 104, hemY: 404, neck: "collar", detail: "buttons", pockets: "chest", back }, p);
    case "blazer": return top({ neckW: 34, neckY: 58, shoulder: 102, shoulderY: 80, sleeve: "long", body: 106, hemY: 372, neck: "lapel", detail: "blazer", back }, p);
    case "coat": return top({ neckW: 34, neckY: 54, shoulder: 104, shoulderY: 76, sleeve: "long", body: 114, hemY: 474, hemDx: 128, neck: "lapel", detail: "coat", back }, p);
    case "knit": return top({ neckW: 36, neckY: 62, shoulder: 94, shoulderY: 82, sleeve: "long", body: 106, hemY: 396, neck: "crew", detail: "knit", back }, p);
    case "cardigan": return top({ neckW: 38, neckY: 60, shoulder: 98, shoulderY: 80, sleeve: "long", body: 112, hemY: 408, neck: "v", detail: "cardigan", back }, p);
    case "trousers": return bottoms({ waist: 76, hip: 88, hemOuter: 86, hemInner: 26, hemY: 456, style: "trouser", back }, p);
    case "cargo": return bottoms({ waist: 76, hip: 92, hemOuter: 80, hemInner: 24, hemY: 450, style: "cargo", back }, p);
    case "jeans": return bottoms({ waist: 74, hip: 84, hemOuter: 82, hemInner: 24, hemY: 454, style: "jeans", back }, p);
    case "shorts": return bottoms({ waist: 76, hip: 90, hemOuter: 90, hemInner: 18, hemY: 330, crotchY: 240, style: "shorts", back }, p);
    case "dress": return dress(p, back);
    case "skirt": return skirt(p);
    case "tote": return tote(p);
    case "scarf": return scarf(p);
    case "cap": return cap(p);
    case "belt": return belt(p);
    case "sneaker": return sneaker(p);
  }
}

/* ---------- public API ---------- */
const DUMMY: Pal = { base: "#888888", dark: "#666666", deep: "#444444", light: "#999999", seam: "#000000", hi: "#ffffff" };

/** Scales and centres the artwork so every piece fills the frame similarly. */
function layout(art: Art) {
  const height = art.shadowY - art.y0;
  const s = Math.min(1.16, 430 / height, 188 / art.hw);
  const cy = (art.y0 + art.shadowY) / 2;
  return { s, cy, fx: (art.focus[0] - 200) * s + 200, fy: (art.focus[1] - cy) * s + 250 };
}

const ZOOM = 1.85;

export function garmentViewBox(kind: ArtKind, view: number): string {
  if (view !== 2) return "0 0 400 500";
  const l = layout(build(kind, DUMMY, false));
  const w = 400 / ZOOM, h = 500 / ZOOM;
  const x = Math.max(0, Math.min(400 - w, l.fx - w / 2));
  const y = Math.max(0, Math.min(500 - h, l.fy - h / 2));
  return `${f1(x)} ${f1(y)} ${f1(w)} ${f1(h)}`;
}

export interface GarmentOpts {
  kind: ArtKind;
  color: string;
  view?: number; // 0 front, 1 alt flat-lay, 2 fabric detail, 3 back
  finish?: Finish;
  uid: string; // unique id prefix so gradients never collide between instances
  bg?: string; // optional backdrop colour override
}

export function garmentSvg({ kind, color, view = 0, finish, uid, bg: bgOverride }: GarmentOpts): string {
  const L = luminance(color);
  const dark = L < 0.2;
  const pal: Pal = {
    base: color,
    dark: mix(color, "#000000", 0.22),
    deep: mix(color, "#000000", dark ? 0.55 : 0.42),
    light: mix(color, "#ffffff", dark ? 0.1 : 0.14),
    seam: dark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.28)",
    hi: dark ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.4)",
  };
  const back = view === 3;
  const art = build(kind, pal, back);
  const fin = finish ?? finishFor(kind);
  const lay = layout(art);

  const lightBg = ["#EFE9DF", "#D9CCB5"];
  const altBg = ["#CBBDA6", "#2A2825", "#8E8576"];
  const byContrast = (c: string[]) => [...c].sort((a, b) => Math.abs(luminance(b) - L) - Math.abs(luminance(a) - L))[0];
  const bgMain = byContrast(lightBg);
  const bgAlt = byContrast(altBg.filter((c) => Math.abs(luminance(c) - L) > 0.12));
  const bg = bgOverride ?? (view === 1 ? bgAlt : view === 3 ? "#F3EFE8" : bgMain);
  const bgDark = luminance(bg) < 0.3;

  const rot = view === 1 ? -5 : view === 3 ? 2 : 0;
  const sheen = fin === "satin" ? 0.42 : fin === "leather" ? 0.26 : 0.14;
  const zoomed = view === 2;
  const tex = zoomed ? 0.16 : 0.07;

  const patterns: Record<Finish, string> = {
    weave: `<pattern id="${uid}-tx" width="${zoomed ? 3.4 : 3}" height="${zoomed ? 3.4 : 3}" patternUnits="userSpaceOnUse"><path d="M0 0H${zoomed ? 3.4 : 3}M0 0V${zoomed ? 3.4 : 3}" stroke="#000" stroke-width=".5" opacity="${zoomed ? 0.16 : 0.15}"/></pattern>`,
    rib: `<pattern id="${uid}-tx" width="${zoomed ? 7 : 5}" height="8" patternUnits="userSpaceOnUse"><rect width="${zoomed ? 3.4 : 2.4}" height="8" fill="#000" opacity="${tex * 1.9}"/></pattern>`,
    twill: `<pattern id="${uid}-tx" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(58)"><rect width="2.2" height="5" fill="#000" opacity="${tex * 2}"/></pattern>`,
    satin: `<pattern id="${uid}-tx" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="none"/></pattern>`,
    leather: `<pattern id="${uid}-tx" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".7" fill="#000" opacity="${tex * 2.6}"/><circle cx="4.5" cy="4.5" r=".6" fill="#fff" opacity="${tex * 1.8}"/></pattern>`,
  };

  const shadowOpacity = bgDark ? 0.5 : 0.16;
  const shadowY = (art.shadowY - lay.cy) * lay.s + 250;
  const transform = `translate(200 250) rotate(${rot}) scale(${f1(lay.s * (view === 1 ? 1.03 : 1))}) translate(-200 ${-lay.cy})`;
  const shapeInner = art.shape.includes("<") ? art.shape : `<path d="${art.shape}"/>`;

  return `<defs>
<linearGradient id="${uid}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(bg, "#ffffff", bgDark ? 0.06 : 0.35)}"/><stop offset="1" stop-color="${mix(bg, "#000000", bgDark ? 0.2 : 0.08)}"/></linearGradient>
<radialGradient id="${uid}-gl" cx=".5" cy=".38" r=".7"><stop offset="0" stop-color="#fff" stop-opacity="${bgDark ? 0.1 : 0.55}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="${uid}-sh" x1="0" y1="0" x2="1" y2="0.25"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".32" stop-color="#fff" stop-opacity="0"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient>
<linearGradient id="${uid}-sn" x1="0" y1="0" x2="1" y2="1"><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity="${sheen}"/><stop offset=".58" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="${uid}-fl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity="${shadowOpacity}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
${patterns[fin]}
<g id="${uid}-s">${shapeInner}</g>
</defs>
<rect width="400" height="500" fill="url(#${uid}-bg)"/>
<rect width="400" height="500" fill="url(#${uid}-gl)"/>
<ellipse cx="200" cy="${f1(shadowY)}" rx="${f1(art.shadowW * lay.s)}" ry="${f1(14 * lay.s)}" fill="url(#${uid}-fl)"/>
<g transform="${transform}">
${art.extraBehind ?? ""}
<use href="#${uid}-s" fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
<use href="#${uid}-s" fill="url(#${uid}-sh)"/>
<use href="#${uid}-s" fill="url(#${uid}-tx)"/>
<use href="#${uid}-s" fill="url(#${uid}-sn)"/>
${art.details}
</g>`;
}
