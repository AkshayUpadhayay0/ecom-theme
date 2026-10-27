import type { Metadata } from "next";
import { TrackForm } from "@/components/account/track-form";

export const metadata: Metadata = { title: "Track your order", description: "Look up an order with your order number and email address." };

export default function TrackPage() {
  return <TrackForm />;
}
