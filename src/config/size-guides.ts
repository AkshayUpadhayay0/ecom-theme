import type { SizeGuideKey } from "@/lib/types";

export interface SizeGuide {
  title: string;
  note: string;
  head: string[];
  rows: string[][];
}

const NOTE = "Measurements are body measurements in centimetres. Between two sizes? Size up for a relaxed fit, size down for a closer one.";

export const SIZE_GUIDES: Record<SizeGuideKey, SizeGuide> = {
  tops_men: {
    title: "Men's tops",
    note: NOTE,
    head: ["Size", "Chest", "Waist", "Shoulder"],
    rows: [["XS", "86", "72", "42"], ["S", "92", "78", "44"], ["M", "98", "84", "46"], ["L", "104", "90", "48"], ["XL", "110", "96", "50"], ["XXL", "116", "102", "52"]],
  },
  tops_women: {
    title: "Women's tops & dresses",
    note: NOTE,
    head: ["Size", "Bust", "Waist", "Hip"],
    rows: [["XS", "80", "62", "86"], ["S", "85", "67", "91"], ["M", "90", "72", "96"], ["L", "95", "77", "101"], ["XL", "100", "82", "106"], ["XXL", "105", "87", "111"]],
  },
  bottoms_men: {
    title: "Men's bottoms",
    note: NOTE,
    head: ["Size", "Waist", "Hip", "Inseam"],
    rows: [["28", "71", "92", "80"], ["30", "76", "97", "81"], ["32", "81", "102", "82"], ["34", "86", "107", "82"], ["36", "91", "112", "83"]],
  },
  bottoms_women: {
    title: "Women's bottoms",
    note: NOTE,
    head: ["Size", "Waist", "Hip", "Inseam"],
    rows: [["26", "66", "92", "76"], ["28", "71", "97", "77"], ["30", "76", "102", "78"], ["32", "81", "107", "78"], ["34", "86", "112", "79"]],
  },
  shoes: {
    title: "Footwear (UK sizing)",
    note: "Measure your foot from heel to longest toe. Our sneakers fit true to size; choose the next size up for thick socks.",
    head: ["UK", "EU", "Foot length (cm)"],
    rows: [["6", "39", "24.5"], ["7", "40.5", "25.4"], ["8", "42", "26.2"], ["9", "43", "27.1"], ["10", "44.5", "27.9"], ["11", "46", "28.8"]],
  },
  one: {
    title: "Accessories",
    note: "This item is made in a single size. See the product details for dimensions.",
    head: ["Size"],
    rows: [["One size"]],
  },
};
