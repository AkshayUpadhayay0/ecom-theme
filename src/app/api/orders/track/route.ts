import { orderToken, rateLimit } from "@/lib/auth";
import { body, clientIp, fail, json, sameOrigin } from "@/lib/http";
import { getOrder } from "@/lib/orders";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (!rateLimit(`track:${clientIp(req)}`, 10, 15 * 60_000)) return fail("Too many attempts. Please try again later.", 429);
  const b = await body<{ number?: string; email?: string }>(req);
  const number = (b?.number ?? "").trim().toUpperCase();
  const email = (b?.email ?? "").trim().toLowerCase();
  const o = number ? getOrder(number) : null;
  // Same message whether the number or the email is wrong, so order numbers can't be probed.
  if (!o || o.email.toLowerCase() !== email) return fail("We couldn't find an order with those details.", 404);
  return json({ url: `/order/${o.number}?t=${orderToken(o.number)}` });
}
