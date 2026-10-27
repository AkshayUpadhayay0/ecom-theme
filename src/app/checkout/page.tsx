import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getUser } from "@/lib/auth";
import { razorpayEnabled } from "@/lib/payments";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getUser();
  return <CheckoutForm onlineEnabled={razorpayEnabled()} user={user} />;
}
