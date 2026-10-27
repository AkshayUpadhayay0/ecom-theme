import { createSession, findUserByEmail, rateLimit, registerUser } from "@/lib/auth";
import { body, clientIp, fail, json, sameOrigin } from "@/lib/http";
import { isEmail, isPhone } from "@/lib/utils";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (!rateLimit(`reg:${clientIp(req)}`, 10, 15 * 60_000)) return fail("Too many attempts. Please try again later.", 429);
  const b = await body<{ name?: string; email?: string; password?: string; phone?: string }>(req);
  if (!b) return fail("Invalid request.");
  const name = (b.name ?? "").trim();
  const email = (b.email ?? "").trim().toLowerCase();
  const password = b.password ?? "";
  const phone = (b.phone ?? "").trim();
  if (name.length < 2 || name.length > 80) return fail("Please enter your full name.");
  if (!isEmail(email)) return fail("Please enter a valid email address.");
  if (password.length < 8 || password.length > 128) return fail("Password must be at least 8 characters.");
  if (phone && !isPhone(phone)) return fail("Please enter a valid 10-digit mobile number.");
  if (findUserByEmail(email)) return fail("An account with this email already exists. Try signing in.", 409);
  const id = await registerUser({ name, email, password, phone: phone || undefined });
  await createSession(id);
  return json({ user: { id, name, email, phone: phone || null } }, 201);
}
