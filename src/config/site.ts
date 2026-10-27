import type { ArtKind } from "@/lib/types";

/**
 * One place for brand, commerce rules and content. Change the name here and it
 * updates the header, footer, SEO metadata and emails-to-be everywhere.
 */
export const SITE = {
  name: "MAISON NOIR",
  shortName: "Maison Noir",
  tagline: "Considered clothing for everyday life",
  description:
    "Maison Noir is a contemporary fashion house: tailored essentials, elevated streetwear and timeless layers, designed in India.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Replace with your real support details before launch.
  supportEmail: "care@maisonnoir.example",
  supportPhone: "+91 00000 00000",
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "X", href: "https://x.com" },
  ],
} as const;

export const COMMERCE = {
  freeShippingThreshold: 2999,
  shippingFee: 99,
  codFee: 40,
  codMaxOrder: 20000,
  returnDays: 14,
  reservationMinutes: 30,
} as const;

export const ANNOUNCEMENTS = [
  "Complimentary shipping on orders above ₹2,999",
  "Festive Edit: 15% off with code FESTIVE15 on orders above ₹4,999",
  "Easy 14-day returns · Cash on Delivery available",
];

export interface NavMega {
  columns: { title: string; links: [label: string, href: string][] }[];
  feature: { label: string; href: string; kind: ArtKind; color: string };
}
export interface NavItem { label: string; href: string; accent?: boolean; mega?: NavMega }

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Men",
    href: "/shop?gender=men",
    mega: {
      columns: [
        { title: "Clothing", links: [["Tees & Shirts", "/shop?gender=men&category=Tops"], ["Hoodies & Sweats", "/shop?gender=men&category=Hoodies"], ["Outerwear", "/shop?gender=men&category=Outerwear"], ["Knitwear", "/shop?gender=men&category=Knitwear"], ["Bottoms & Denim", "/shop?gender=men&category=Bottoms"]] },
        { title: "Edits", links: [["New Arrivals", "/shop?gender=men&new=1&sort=newest"], ["Streetwear", "/shop?gender=men&style=streetwear"], ["Casual", "/shop?gender=men&style=casual"], ["Tailored", "/shop?gender=men&style=tailored"], ["Sale", "/shop?gender=men&sale=1"]] },
      ],
      feature: { label: "The Overshirt Edit", href: "/product/wool-blend-overshirt-jacket", kind: "jacket", color: "#B58B5A" },
    },
  },
  {
    label: "Women",
    href: "/shop?gender=women",
    mega: {
      columns: [
        { title: "Clothing", links: [["Dresses", "/shop?gender=women&category=Dresses"], ["Tops & Shirts", "/shop?gender=women&category=Tops"], ["Outerwear", "/shop?gender=women&category=Outerwear"], ["Knitwear", "/shop?gender=women&category=Knitwear"], ["Bottoms & Skirts", "/shop?gender=women&category=Bottoms"]] },
        { title: "Edits", links: [["New Arrivals", "/shop?gender=women&new=1&sort=newest"], ["Occasion", "/shop?gender=women&style=occasion"], ["Tailored", "/shop?gender=women&style=tailored"], ["Essentials", "/shop?gender=women&style=essentials"], ["Sale", "/shop?gender=women&sale=1"]] },
      ],
      feature: { label: "The Camel Coat", href: "/product/longline-wool-coat", kind: "coat", color: "#B58B5A" },
    },
  },
  { label: "Collections", href: "/collections" },
  { label: "New Arrivals", href: "/shop?new=1&sort=newest" },
  { label: "Sale", href: "/shop?sale=1", accent: true },
];

export const COLLECTIONS = [
  { slug: "men", title: "Men's Wear", href: "/shop?gender=men", kind: "jacket" as const, bg: "#d9cdb8", fg: "#2f3e34", blurb: "Structured layers, quiet colour." },
  { slug: "women", title: "Women's Wear", href: "/shop?gender=women", kind: "dress" as const, bg: "#e6d3bd", fg: "#5e1f2b", blurb: "Fluid tailoring and slip silhouettes." },
  { slug: "streetwear", title: "Streetwear", href: "/shop?style=streetwear", kind: "hoodie" as const, bg: "#1b1b1a", fg: "#cfc1aa", blurb: "Heavyweight cotton, relaxed fits." },
  { slug: "casual", title: "Casual Wear", href: "/shop?style=casual", kind: "shirt" as const, bg: "#c9d3da", fg: "#2b3a55", blurb: "Easy pieces for every day." },
  { slug: "accessories", title: "Accessories", href: "/shop?category=Accessories", kind: "tote" as const, bg: "#e9dfd0", fg: "#a9753f", blurb: "Leather, wool and finishing touches." },
] as const;

export const TESTIMONIALS = [
  { name: "Ananya R.", city: "Bengaluru", rating: 5, text: "The trousers drape beautifully and the fabric feels far more expensive than the price. I have worn them three days in a row." },
  { name: "Kabir T.", city: "Mumbai", rating: 5, text: "The heavyweight tee is the best fitting boxy tee I own. It kept its shape after a dozen washes." },
  { name: "Meera N.", city: "Delhi", rating: 4, text: "Packaging was lovely and delivery was quick. The coat runs slightly generous, so the size guide helped." },
  { name: "Rohan K.", city: "Pune", rating: 5, text: "Clean, minimal, and nothing shouts. Exactly the wardrobe basics I was looking for." },
];

export const FOOTER_LINKS = {
  Shop: [["Women", "/shop?gender=women"], ["Men", "/shop?gender=men"], ["New Arrivals", "/shop?new=1&sort=newest"], ["Collections", "/collections"], ["Sale", "/shop?sale=1"]],
  Support: [["Track your order", "/track"], ["Shipping & delivery", "/pages/shipping"], ["Returns & exchanges", "/pages/returns"], ["Size guide", "/pages/size-guide"], ["Contact us", "/pages/contact"]],
  Company: [["Our story", "/pages/about"], ["Care guide", "/pages/care"], ["Privacy policy", "/pages/privacy"], ["Terms of service", "/pages/terms"]],
} as const;

export const PAYMENT_METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Cash on Delivery"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];
