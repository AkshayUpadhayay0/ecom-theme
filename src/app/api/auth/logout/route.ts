import { destroySession } from "@/lib/auth";
import { fail, json, sameOrigin } from "@/lib/http";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  await destroySession();
  return json({ ok: true });
}
