import { rateLimit } from "@/lib/auth";
import { body, clientIp, fail, json, sameOrigin } from "@/lib/http";
import { subscribe } from "@/lib/repo";
import { isEmail } from "@/lib/utils";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (!rateLimit(`news:${clientIp(req)}`, 6, 10 * 60_000)) return fail("Too many attempts. Please try again later.", 429);
  const b = await body<{ email?: string }>(req);
  const email = (b?.email ?? "").trim().toLowerCase();
  if (!isEmail(email)) return fail("Please enter a valid email address.");
  const added = subscribe(email);
  return json({ ok: true, already: !added });
}
