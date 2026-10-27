import type { ArtKind, Gender, SizeGuideKey } from "./types";

type C = [name: string, hex: string];

export interface SeedProduct {
  slug: string;
  name: string;
  subtitle: string;
  gender: Gender;
  category: string;
  style: string;
  kind: ArtKind;
  season: string;
  price: number;
  mrp?: number;
  isNew?: boolean;
  best?: boolean;
  popularity: number;
  daysAgo: number;
  colors: C[];
  sizes: keyof typeof SIZES;
  sizeGuide: SizeGuideKey;
  description: string;
  fabric: string;
  fit: string;
  care: keyof typeof CARE;
  details: string[];
}

export const SIZES = {
  tops: ["XS", "S", "M", "L", "XL", "XXL"],
  womenTops: ["XS", "S", "M", "L", "XL"],
  bottomsM: ["28", "30", "32", "34", "36"],
  bottomsW: ["26", "28", "30", "32", "34"],
  shoes: ["6", "7", "8", "9", "10", "11"],
  one: ["One size"],
} as const;

export const CARE = {
  cotton: ["Machine wash cold with similar colours", "Do not bleach", "Tumble dry low or line dry", "Warm iron if needed"],
  linen: ["Machine wash cold on a gentle cycle", "Line dry in shade", "Iron while slightly damp", "Do not tumble dry"],
  wool: ["Dry clean recommended", "Or hand wash cold with wool detergent", "Dry flat, away from direct heat", "Steam to refresh; do not wring"],
  knit: ["Hand wash cold or use a wool cycle", "Reshape and dry flat", "Store folded, never hung", "Use a fabric shaver to remove pilling"],
  denim: ["Wash inside out, cold, sparingly", "Wash separately for the first few washes", "Line dry", "Iron inside out on medium heat"],
  satin: ["Hand wash cold or dry clean", "Do not wring or twist", "Dry in shade", "Iron on lowest heat, inside out"],
  leather: ["Wipe with a soft dry cloth", "Condition every few months", "Keep away from water and direct heat", "Store in the dust bag provided"],
  tech: ["Machine wash cold, zip closed", "Do not use fabric softener", "Line dry", "Do not iron"],
} as const;

const WOMEN_TOPS = "tops_women" as const;
const MEN_TOPS = "tops_men" as const;

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "heavyweight-boxy-tee", name: "Heavyweight Boxy Tee", subtitle: "280 GSM combed cotton", gender: "men", category: "Tops", style: "streetwear", kind: "tee", season: "core",
    price: 1799, isNew: true, best: true, popularity: 98, daysAgo: 6,
    colors: [["Ecru", "#E8DFCF"], ["Black", "#151515"], ["Washed Olive", "#6B6B4E"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "A dense, structured tee with a dropped shoulder and a cropped boxy body. Cut from garment-washed combed cotton that softens with every wear.",
    fabric: "100% combed cotton, 280 GSM, garment washed", fit: "Boxy, true to size. Size down for a closer fit.", care: "cotton",
    details: ["Dropped shoulder, cropped length", "Double-needle ribbed collar", "Pre-shrunk and enzyme washed", "Woven neck label"],
  },
  {
    slug: "oxford-linen-blend-shirt", name: "Oxford Linen-Blend Shirt", subtitle: "Breathable weekend shirt", gender: "men", category: "Tops", style: "casual", kind: "shirt", season: "core",
    price: 3299, popularity: 84, daysAgo: 40,
    colors: [["Sky Chalk", "#C9D3DA"], ["Cream", "#EFE7D6"], ["Charcoal", "#3A3A3A"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "A relaxed button-down in a cotton-linen oxford weave. Light enough for humid days, polished enough to wear untucked or tucked.",
    fabric: "60% cotton, 40% linen", fit: "Regular fit, true to size.", care: "linen",
    details: ["Button-down collar", "Mother-of-pearl effect buttons", "Single chest pocket", "Curved hem for untucked wear"],
  },
  {
    slug: "essential-zip-hoodie", name: "Essential Zip Hoodie", subtitle: "Brushed-back fleece", gender: "men", category: "Hoodies", style: "streetwear", kind: "hoodie", season: "aw26",
    price: 4499, mrp: 5499, best: true, popularity: 95, daysAgo: 55,
    colors: [["Black", "#151515"], ["Heather Grey", "#A9A9A5"], ["Sand", "#CDBA9A"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "Our everyday hoodie in a substantial brushed-back fleece with a full zip, deep hood and clean, hardware-light finishing.",
    fabric: "80% cotton, 20% recycled polyester fleece, 420 GSM", fit: "Relaxed, true to size.", care: "cotton",
    details: ["Full-length metal zip", "Double-layer hood", "Kangaroo pockets", "Ribbed cuffs and hem"],
  },
  {
    slug: "wool-blend-overshirt-jacket", name: "Wool-Blend Overshirt Jacket", subtitle: "The layering piece", gender: "men", category: "Outerwear", style: "casual", kind: "jacket", season: "aw26",
    price: 6999, isNew: true, popularity: 90, daysAgo: 4,
    colors: [["Camel", "#B58B5A"], ["Forest", "#2F3E34"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "A shirt-jacket in a brushed wool blend. Wear it open over a tee or buttoned to the collar as the evenings cool.",
    fabric: "55% wool, 35% polyester, 10% nylon", fit: "Slightly oversized, true to size.", care: "wool",
    details: ["Two chest flap pockets", "Two hand pockets", "Horn-effect buttons", "Half-lined shoulders"],
  },
  {
    slug: "pleated-tailored-trouser", name: "Pleated Tailored Trouser", subtitle: "Fluid drape, tapered leg", gender: "men", category: "Bottoms", style: "tailored", kind: "trousers", season: "core",
    price: 4299, popularity: 80, daysAgo: 70,
    colors: [["Charcoal", "#3A3A3A"], ["Stone", "#B9AE9B"], ["Black", "#151515"]], sizes: "bottomsM", sizeGuide: "bottoms_men",
    description: "Double-pleated trousers with a high rise and a gently tapered leg. A fluid wool-touch fabric keeps the line sharp from desk to dinner.",
    fabric: "70% polyester, 28% viscose, 2% elastane", fit: "Relaxed through the thigh, tapered below the knee.", care: "wool",
    details: ["Double front pleats", "Side adjusters", "Hidden hook-and-bar closure", "Fully finished interior"],
  },
  {
    slug: "straight-selvedge-jeans", name: "Straight Selvedge Jeans", subtitle: "13 oz Japanese-style denim", gender: "men", category: "Bottoms", style: "casual", kind: "jeans", season: "core",
    price: 4999, mrp: 5999, popularity: 86, daysAgo: 90,
    colors: [["Indigo", "#2B3A55"], ["Washed Black", "#2A2A2C"]], sizes: "bottomsM", sizeGuide: "bottoms_men",
    description: "A straight-leg jean in a heavyweight selvedge-style denim that fades into something personal over time.",
    fabric: "100% cotton denim, 13 oz", fit: "Straight, mid rise. True to size; denim will relax by about half a size.", care: "denim",
    details: ["Selvedge-style coin pocket edge", "Copper-tone rivets", "Button fly", "Chain-stitched hem"],
  },
  {
    slug: "cargo-utility-pant", name: "Cargo Utility Pant", subtitle: "Ripstop, relaxed taper", gender: "men", category: "Bottoms", style: "streetwear", kind: "cargo", season: "aw26",
    price: 3999, isNew: true, popularity: 82, daysAgo: 9,
    colors: [["Khaki", "#A89A78"], ["Black", "#151515"]], sizes: "bottomsM", sizeGuide: "bottoms_men",
    description: "A modern cargo with a clean silhouette, in a tightly woven cotton ripstop that resists wear and moves easily.",
    fabric: "98% cotton ripstop, 2% elastane", fit: "Relaxed, tapered ankle.", care: "cotton",
    details: ["Articulated knees", "Bellows cargo pockets", "Drawcord hem", "Elasticated back waist"],
  },
  {
    slug: "ribbed-merino-crew-knit", name: "Ribbed Merino Crew Knit", subtitle: "Soft, fine-gauge merino", gender: "men", category: "Knitwear", style: "essentials", kind: "knit", season: "aw26",
    price: 4799, popularity: 78, daysAgo: 28,
    colors: [["Oat", "#D9CDB6"], ["Navy", "#1F2A44"], ["Chestnut", "#7A4A2E"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "A fine ribbed crew in soft merino blend that layers under a jacket and holds its shape across seasons.",
    fabric: "50% merino wool, 50% cotton", fit: "Regular, true to size.", care: "knit",
    details: ["Fine 12-gauge rib", "Fully fashioned shoulders", "Contrast-free finishing", "Itch-free handfeel"],
  },
  {
    slug: "washed-denim-trucker-jacket", name: "Washed Denim Trucker Jacket", subtitle: "Boxy, cropped, broken-in", gender: "men", category: "Outerwear", style: "streetwear", kind: "jacket", season: "core",
    price: 5999, mrp: 7499, popularity: 76, daysAgo: 120,
    colors: [["Mid Blue", "#5C7396"], ["Black", "#151515"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "The classic trucker, washed for a lived-in feel, with a boxy cut that sits cleanly over a hoodie.",
    fabric: "100% cotton denim, 11 oz", fit: "Boxy, true to size.", care: "denim",
    details: ["Pleated chest pockets", "Adjustable side tabs", "Metal shank buttons", "Stone washed"],
  },
  {
    slug: "relaxed-linen-shorts", name: "Relaxed Linen Shorts", subtitle: "Pull-on, mid-thigh", gender: "men", category: "Bottoms", style: "casual", kind: "shorts", season: "core",
    price: 2199, popularity: 62, daysAgo: 150,
    colors: [["Sand", "#CDBA9A"], ["White", "#F4F1EA"], ["Navy", "#1F2A44"]], sizes: "bottomsM", sizeGuide: "bottoms_men",
    description: "Easy shorts in a washed linen-cotton blend, finished with an elastic waist and a drawcord.",
    fabric: "55% linen, 45% cotton", fit: "Relaxed, mid-thigh length.", care: "linen",
    details: ["Elastic waist with drawcord", "Two side pockets", "One back pocket", "Washed for softness"],
  },
  {
    slug: "satin-slip-midi-dress", name: "Satin Slip Midi Dress", subtitle: "Bias-cut, fluid", gender: "women", category: "Dresses", style: "occasion", kind: "dress", season: "aw26",
    price: 5499, best: true, popularity: 97, daysAgo: 20,
    colors: [["Champagne", "#E3CFA8"], ["Black", "#151515"], ["Bordeaux", "#5E1F2B"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A bias-cut slip dress in a heavy, liquid satin. Slim adjustable straps and a cowl neckline make it effortless to dress up or down.",
    fabric: "100% recycled polyester satin", fit: "Skims the body, true to size.", care: "satin",
    details: ["Bias cut for movement", "Adjustable straps", "Cowl neckline", "Side slit"],
  },
  {
    slug: "tailored-wide-leg-trouser", name: "Tailored Wide-Leg Trouser", subtitle: "High rise, full length", gender: "women", category: "Bottoms", style: "tailored", kind: "trousers", season: "core",
    price: 4599, popularity: 88, daysAgo: 35,
    colors: [["Ivory", "#EFE8DA"], ["Black", "#151515"], ["Taupe", "#8F7F6D"]], sizes: "bottomsW", sizeGuide: "bottoms_women",
    description: "A high-rise trouser with a wide, floor-grazing leg and a crisp front crease. Cut from a weighty crepe that falls cleanly.",
    fabric: "68% polyester, 28% viscose, 4% elastane", fit: "Wide leg, true to size.", care: "wool",
    details: ["Front crease", "Hidden zip closure", "Slant pockets", "Belt loops"],
  },
  {
    slug: "cropped-wool-blazer", name: "Cropped Wool Blazer", subtitle: "Sharp shoulder, cropped body", gender: "women", category: "Outerwear", style: "tailored", kind: "blazer", season: "aw26",
    price: 7999, mrp: 9999, popularity: 85, daysAgo: 33,
    colors: [["Black", "#151515"], ["Camel", "#B58B5A"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A cropped single-breasted blazer with a structured shoulder, cut from a wool blend that holds its shape.",
    fabric: "60% wool, 38% polyester, 2% elastane. Lining: 100% viscose", fit: "Cropped, true to size.", care: "wool",
    details: ["Padded shoulders", "Two-button closure", "Notch lapel", "Fully lined"],
  },
  {
    slug: "poplin-wrap-shirt-dress", name: "Poplin Wrap Shirt Dress", subtitle: "Crisp cotton, tie waist", gender: "women", category: "Dresses", style: "casual", kind: "dress", season: "core",
    price: 4299, popularity: 74, daysAgo: 80,
    colors: [["White", "#F4F1EA"], ["Sage", "#9AA58D"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A crisp poplin dress with a wrap front and a tie waist, designed to flatter and to travel well.",
    fabric: "100% organic cotton poplin", fit: "Relaxed with a defined waist.", care: "cotton",
    details: ["Wrap closure with inner tie", "Collared neckline", "Side seam pockets", "Midi length"],
  },
  {
    slug: "chunky-cable-cardigan", name: "Chunky Cable Cardigan", subtitle: "Soft, substantial knit", gender: "women", category: "Knitwear", style: "essentials", kind: "cardigan", season: "aw26",
    price: 5299, popularity: 79, daysAgo: 22,
    colors: [["Cream", "#EFE7D6"], ["Mocha", "#8B6B55"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A generous cable-knit cardigan with horn-effect buttons. Wear it over everything from slip dresses to denim.",
    fabric: "60% cotton, 30% acrylic, 10% wool", fit: "Oversized, true to size.", care: "knit",
    details: ["Cable and rib stitch", "Horn-effect buttons", "Patch pockets", "Dropped shoulder"],
  },
  {
    slug: "pleated-satin-skirt", name: "Pleated Satin Skirt", subtitle: "Knife pleats, midi", gender: "women", category: "Bottoms", style: "occasion", kind: "skirt", season: "aw26",
    price: 3799, isNew: true, popularity: 81, daysAgo: 7,
    colors: [["Champagne", "#E3CFA8"], ["Black", "#151515"], ["Olive", "#6B6B4E"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A fluid knife-pleated midi skirt that catches the light as you move.",
    fabric: "100% recycled polyester satin", fit: "Mid rise, true to size.", care: "satin",
    details: ["Heat-set knife pleats", "Concealed side zip", "Elasticated back waist", "Midi length"],
  },
  {
    slug: "oversized-cotton-poplin-shirt", name: "Oversized Cotton Poplin Shirt", subtitle: "Borrowed-from-the-boys fit", gender: "women", category: "Tops", style: "casual", kind: "shirt", season: "core",
    price: 2999, popularity: 83, daysAgo: 60,
    colors: [["White", "#F4F1EA"], ["Blue", "#A9BCD0"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "An oversized shirt in crisp cotton poplin with a generous cut and a curved hem. Wear it open, tied, or buttoned.",
    fabric: "100% organic cotton poplin", fit: "Oversized. Size down for a standard fit.", care: "cotton",
    details: ["Dropped shoulder", "Extended cuffs", "Curved hem", "Pearl-effect buttons"],
  },
  {
    slug: "longline-wool-coat", name: "Longline Wool Coat", subtitle: "Our signature winter coat", gender: "women", category: "Outerwear", style: "tailored", kind: "coat", season: "aw26",
    price: 11999, mrp: 14999, best: true, popularity: 96, daysAgo: 45,
    colors: [["Camel", "#B58B5A"], ["Charcoal", "#3A3A3A"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A single-breasted longline coat in a dense, brushed wool blend. Generously cut to layer over knitwear.",
    fabric: "70% wool, 30% polyamide. Lining: 100% viscose", fit: "Relaxed, true to size.", care: "wool",
    details: ["Notch lapel", "Concealed button placket", "Two welt pockets", "Back vent"],
  },
  {
    slug: "baggy-utility-jeans", name: "Baggy Utility Jeans", subtitle: "Low-slung, wide leg", gender: "women", category: "Bottoms", style: "streetwear", kind: "jeans", season: "aw26",
    price: 4799, isNew: true, popularity: 87, daysAgo: 12,
    colors: [["Light Wash", "#A8BBD0"], ["Black", "#151515"]], sizes: "bottomsW", sizeGuide: "bottoms_women",
    description: "A relaxed wide-leg jean with a lived-in wash and a mid rise, built for everyday wear.",
    fabric: "100% cotton denim, 12 oz", fit: "Baggy, true to size.", care: "denim",
    details: ["Wide leg", "Utility patch pockets", "Button fly", "Stonewashed"],
  },
  {
    slug: "ribbed-cotton-baby-tee", name: "Ribbed Cotton Baby Tee", subtitle: "Fitted, cropped, soft", gender: "women", category: "Tops", style: "essentials", kind: "tee", season: "core",
    price: 1499, best: true, popularity: 92, daysAgo: 100,
    colors: [["White", "#F4F1EA"], ["Black", "#151515"], ["Mauve", "#B79AA0"]], sizes: "womenTops", sizeGuide: WOMEN_TOPS,
    description: "A fitted rib-knit tee with a cropped hem. The easy base layer for everything.",
    fabric: "95% cotton, 5% elastane rib", fit: "Fitted, true to size.", care: "cotton",
    details: ["Soft rib-knit", "Scoop neckline", "Cropped length", "Stretch recovery"],
  },
  {
    slug: "oversized-crewneck-sweatshirt", name: "Oversized Crewneck Sweatshirt", subtitle: "Loopback terry", gender: "unisex", category: "Hoodies", style: "streetwear", kind: "sweat", season: "aw26",
    price: 3299, popularity: 89, daysAgo: 30,
    colors: [["Ash", "#BDB8AE"], ["Black", "#151515"], ["Bone", "#EDE6D8"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "A roomy crewneck in loopback terry with a washed finish. Made to be worn by anyone, any day.",
    fabric: "100% cotton loopback terry, 380 GSM", fit: "Oversized. Size down for a regular fit.", care: "cotton",
    details: ["Dropped shoulder", "Ribbed collar, cuffs and hem", "Pre-shrunk", "Enzyme washed"],
  },
  {
    slug: "technical-shell-jacket", name: "Technical Shell Jacket", subtitle: "Water-repellent, packable", gender: "unisex", category: "Outerwear", style: "streetwear", kind: "jacket", season: "aw26",
    price: 8499, popularity: 77, daysAgo: 25,
    colors: [["Black", "#151515"], ["Stone", "#B9AE9B"]], sizes: "tops", sizeGuide: MEN_TOPS,
    description: "A lightweight shell with a water-repellent finish, taped seams and a hood that packs into the collar.",
    fabric: "100% recycled nylon, DWR finish", fit: "Regular, true to size.", care: "tech",
    details: ["Water-repellent finish", "Taped seams", "Packable hood", "Zip hand pockets"],
  },
  {
    slug: "leather-tote", name: "Leather Tote", subtitle: "Full-grain, unlined", gender: "unisex", category: "Accessories", style: "accessories", kind: "tote", season: "core",
    price: 7499, mrp: 8999, best: true, popularity: 91, daysAgo: 50,
    colors: [["Tan", "#A9753F"], ["Black", "#151515"]], sizes: "one", sizeGuide: "one",
    description: "A roomy tote in vegetable-tanned full-grain leather that develops a rich patina with use.",
    fabric: "100% full-grain leather", fit: "38 cm W × 32 cm H × 14 cm D. Fits a 15-inch laptop.", care: "leather",
    details: ["Vegetable-tanned leather", "Internal zip pocket", "Magnetic closure", "Dust bag included"],
  },
  {
    slug: "merino-wool-scarf", name: "Merino Wool Scarf", subtitle: "Generous, brushed", gender: "unisex", category: "Accessories", style: "accessories", kind: "scarf", season: "aw26",
    price: 2499, isNew: true, popularity: 70, daysAgo: 10,
    colors: [["Oatmeal", "#D9CDB6"], ["Charcoal", "#3A3A3A"], ["Rust", "#9B4A2D"]], sizes: "one", sizeGuide: "one",
    description: "A brushed merino scarf with a soft hand and a generous wrap. Fringed ends for a finished look.",
    fabric: "100% merino wool", fit: "190 cm × 40 cm", care: "knit",
    details: ["Brushed finish", "Hand-fringed ends", "Lightweight warmth", "Gift box available"],
  },
  {
    slug: "six-panel-cap", name: "Six-Panel Cap", subtitle: "Washed cotton twill", gender: "unisex", category: "Accessories", style: "accessories", kind: "cap", season: "core",
    price: 1299, popularity: 66, daysAgo: 130,
    colors: [["Black", "#151515"], ["Stone", "#B9AE9B"], ["Olive", "#6B6B4E"]], sizes: "one", sizeGuide: "one",
    description: "A low-profile six-panel cap in washed cotton twill with a tonal embroidered logo.",
    fabric: "100% cotton twill", fit: "Adjustable strap fits most.", care: "cotton",
    details: ["Unstructured crown", "Tonal embroidery", "Metal-tipped strap", "Curved brim"],
  },
  {
    slug: "full-grain-leather-belt", name: "Full-Grain Leather Belt", subtitle: "30 mm, brushed buckle", gender: "unisex", category: "Accessories", style: "accessories", kind: "belt", season: "core",
    price: 2299, popularity: 64, daysAgo: 140,
    colors: [["Black", "#151515"], ["Brown", "#4A3224"]], sizes: "one", sizeGuide: "one",
    description: "A clean 30 mm belt in vegetable-tanned leather with a brushed metal buckle. Five adjustment holes.",
    fabric: "100% full-grain leather, metal buckle", fit: "Fits waist 28–36 in.", care: "leather",
    details: ["Five adjustment holes", "Brushed buckle", "Edge-painted", "Made to last"],
  },
  {
    slug: "minimal-leather-sneakers", name: "Minimal Leather Sneakers", subtitle: "Italian-style cupsole", gender: "unisex", category: "Footwear", style: "casual", kind: "sneaker", season: "core",
    price: 6499, mrp: 7999, popularity: 93, daysAgo: 65,
    colors: [["White", "#F4F1EA"], ["Black", "#151515"]], sizes: "shoes", sizeGuide: "shoes",
    description: "A clean low-top in smooth leather on a stitched cupsole, with a padded collar and leather lining.",
    fabric: "Leather upper, leather lining, rubber sole", fit: "True to size. Choose the next size up for thick socks.", care: "leather",
    details: ["Stitched cupsole", "Padded collar", "Leather lining", "Removable insole"],
  },
];

export const COUPON_SEED = [
  { code: "WELCOME10", type: "percent", value: 10, min: 1499, max: 1000, description: "10% off your order (up to ₹1,000)", expires: null },
  { code: "MAISON500", type: "flat", value: 500, min: 3999, max: 0, description: "₹500 off orders above ₹3,999", expires: null },
  { code: "FREESHIP", type: "freeship", value: 0, min: 0, max: 0, description: "Free standard shipping", expires: null },
  { code: "FESTIVE15", type: "percent", value: 15, min: 4999, max: 1500, description: "Festive Edit: 15% off (up to ₹1,500)", expires: "2026-11-30T23:59:59.000Z" },
] as const;

export const REVIEW_POOL = [
  ["Exactly what I wanted", "The quality is far better than I expected at this price. The fit is spot on and the fabric feels substantial."],
  ["Beautiful fabric", "You can feel the quality straight out of the box. It has held up well to repeated washing."],
  ["Runs true to size", "Ordered my usual size and it fits perfectly. The size guide on the page was accurate."],
  ["Worth it", "I was unsure about ordering online, but the stitching and finish are excellent. Would order again."],
  ["Subtle and elegant", "Clean lines and a very wearable colour. It goes with almost everything in my wardrobe."],
  ["Slightly generous fit", "Lovely piece, but it runs a touch big. I would size down if you prefer a closer fit."],
  ["Great packaging and delivery", "Arrived quickly, nicely packed. The piece itself looks even better in person."],
  ["My new favourite", "I have worn it more than anything else I bought this season. Comfortable and easy to style."],
  ["Good, but colour differs a little", "The quality is great. The colour is a shade deeper than the screen showed, though I like it."],
  ["Solid everyday piece", "Comfortable, well made and simple. Exactly what a wardrobe basic should be."],
] as const;

export const REVIEW_NAMES = [
  ["Aarav M.", "Mumbai"], ["Priya S.", "Delhi"], ["Rohan K.", "Pune"], ["Ananya R.", "Bengaluru"],
  ["Kabir T.", "Hyderabad"], ["Meera N.", "Jaipur"], ["Vikram J.", "Kolkata"], ["Isha D.", "Chandigarh"],
  ["Arjun P.", "Lucknow"], ["Sana Q.", "Ahmedabad"], ["Neha B.", "Chennai"], ["Rahul G.", "Indore"],
] as const;
