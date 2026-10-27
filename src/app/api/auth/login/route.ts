import { createSession, findUserByEmail, rateLimit, verifyPassword } from "@/lib/auth";
import { body, clientIp, fail, json, sameOrigin } from "@/lib/http";

// A throwaway hash so unknown emails take about as long to reject as wrong passwords.
const DUMMY = "scrypt$00000000000000000000000000000000$" + "00".repeat(64);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  const b = await body<{ email?: string; password?: string }>(req);
  const email = (b?.email ?? "").trim().toLowerCase();
  const password = b?.password ?? "";
  if (!email || !password) return fail("Enter your email and password.");
  if (!rateLimit(`login:${clientIp(req)}:${email}`, 8, 15 * 60_000)) return fail("Too many attempts. Please try again in a few minutes.", 429);
  const user = findUserByEmail(email);
  const ok = await verifyPassword(password, user?.password_hash ?? DUMMY);
  if (!user || !ok) return fail("Incorrect email or password.", 401);
  await createSession(user.id);
  return json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
}
