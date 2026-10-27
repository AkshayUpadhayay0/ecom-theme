import type { ReactNode } from "react";
import { COMMERCE, SITE } from "./site";
import { formatINR } from "@/lib/utils";

export interface InfoPage { title: string; lead: string; body: ReactNode }

const H = ({ children }: { children: ReactNode }) => <h2 className="display mb-3 mt-10 text-2xl">{children}</h2>;
const Placeholder = () => <p className="mt-10 border border-dashed border-sand bg-cream p-4 text-xs text-taupe">Store owner: this page contains sample policy text. Review it with your legal advisor and replace it before launch.</p>;

export const PAGES: Record<string, InfoPage> = {
  shipping: {
    title: "Shipping & delivery",
    lead: "Fast, tracked delivery across India.",
    body: (
      <>
        <H>Delivery times</H>
        <p>Orders are packed within 1–2 business days. Standard delivery takes 3–7 business days depending on your PIN code.</p>
        <H>Shipping charges</H>
        <p>Shipping is free on orders above {formatINR(COMMERCE.freeShippingThreshold)}. Below that, a flat {formatINR(COMMERCE.shippingFee)} applies.</p>
        <H>Cash on Delivery</H>
        <p>Available on orders up to {formatINR(COMMERCE.codMaxOrder)}, with a {formatINR(COMMERCE.codFee)} handling fee.</p>
        <Placeholder />
      </>
    ),
  },
  returns: {
    title: "Returns & exchanges",
    lead: `${COMMERCE.returnDays} days to change your mind.`,
    body: (
      <>
        <H>Our policy</H>
        <p>Unworn, unwashed items with original tags can be returned or exchanged within {COMMERCE.returnDays} days of delivery. Innerwear, accessories marked final sale and gift cards are not eligible.</p>
        <H>How to start a return</H>
        <p>Email <a className="link-u" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> with your order number and the items you'd like to return. We'll arrange a pickup where available.</p>
        <H>Refunds</H>
        <p>Refunds go back to the original payment method after the returned item passes inspection. Cash on Delivery orders are refunded by bank transfer.</p>
        <Placeholder />
      </>
    ),
  },
  contact: {
    title: "Contact us",
    lead: "We're happy to help.",
    body: (
      <>
        <p>Email <a className="link-u" href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> or call {SITE.supportPhone}. Please include your order number if you have one.</p>
        <p className="mt-4 border border-dashed border-sand bg-cream p-4 text-xs text-taupe">Store owner: the email and phone above are placeholders. Set real ones in src/config/site.ts.</p>
      </>
    ),
  },
  about: {
    title: "Our story",
    lead: "Considered clothing for everyday life.",
    body: (
      <>
        <p>Maison Noir designs tailored essentials, elevated streetwear and timeless layers in a restrained palette of black, bone, camel and charcoal. Each piece is made to be worn on repeat and to last.</p>
        <p className="mt-4">We keep collections small, work with heavyweight natural fabrics where we can, and design for the Indian climate and the way people actually dress.</p>
        <p className="mt-4 border border-dashed border-sand bg-cream p-4 text-xs text-taupe">Store owner: replace this with your brand's real story.</p>
      </>
    ),
  },
  care: {
    title: "Care guide",
    lead: "Make your favourites last.",
    body: (
      <>
        <H>Cotton & fleece</H><p>Machine wash cold, inside out. Tumble dry low or dry flat. Avoid bleach.</p>
        <H>Wool & knitwear</H><p>Hand wash or use a wool cycle with a gentle detergent. Dry flat and reshape. Store folded.</p>
        <H>Denim</H><p>Wash rarely and cold. Hang to dry to keep shape and colour.</p>
        <H>Leather & accessories</H><p>Wipe with a soft dry cloth and keep away from prolonged moisture and heat.</p>
        <p className="mt-6 text-sm text-taupe">Always check the care label inside each garment first.</p>
      </>
    ),
  },
  privacy: {
    title: "Privacy policy",
    lead: "What we collect and why.",
    body: (
      <>
        <p>We collect the details needed to process and deliver your order (name, email, phone, address) and to run your account if you create one. Payment card and UPI details are handled by Razorpay and are never stored on our servers.</p>
        <H>Cookies</H><p>We use a single session cookie to keep you signed in. We store your bag and wishlist in your browser.</p>
        <H>Your rights</H><p>Contact {SITE.supportEmail} to access, correct or delete your data.</p>
        <Placeholder />
      </>
    ),
  },
  terms: {
    title: "Terms of service",
    lead: "The basics of shopping with us.",
    body: (
      <>
        <p>By placing an order you agree to provide accurate information and to pay the amount shown at checkout. Prices are in Indian rupees and include applicable taxes. We may cancel an order if an item is unavailable or a pricing error occurred, and will refund any payment received.</p>
        <p className="mt-4">Orders are confirmed only after payment is verified (online payments) or on placement (Cash on Delivery).</p>
        <Placeholder />
      </>
    ),
  },
};
