import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";
import { getUser } from "@/lib/auth";
import { getOrdersForUser, STATUS_LABEL } from "@/lib/orders";
import { orderToken } from "@/lib/auth";

export const metadata: Metadata = { title: "Account", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getUser();
  const orders = user
    ? getOrdersForUser(user.id).map((o) => ({
        number: o.number, createdAt: o.createdAt, total: o.total, status: STATUS_LABEL[o.status] ?? o.status,
        paymentStatus: o.paymentStatus, count: o.items.reduce((n, i) => n + i.qty, 0), token: orderToken(o.number),
        items: o.items.map((i) => i.name),
      }))
    : [];
  return <AccountView orders={orders} />;
}
