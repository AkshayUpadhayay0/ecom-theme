import { getUser } from "@/lib/auth";
import { body, fail, json, sameOrigin } from "@/lib/http";
import { addReview, getProductById } from "@/lib/repo";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  const user = await getUser();
  if (!user) return fail("Please sign in to write a review.", 401);
  const b = await body<{ productId?: number; rating?: number; title?: string; body?: string }>(req);
  if (!b || !Number.isInteger(b.productId) || !getProductById(b.productId!)) return fail("Product not found.", 404);
  const rating = Number(b.rating);
  const title = (b.title ?? "").trim();
  const text = (b.body ?? "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Choose a star rating.");
  if (title.length < 3 || title.length > 80) return fail("Add a short title (3–80 characters).");
  if (text.length < 10 || text.length > 1000) return fail("Tell us a little more (10–1000 characters).");
  const [first, ...rest] = user.name.trim().split(/\s+/);
  const author = rest.length ? `${first} ${rest[rest.length - 1][0].toUpperCase()}.` : first;
  addReview({ productId: b.productId!, userId: user.id, author, rating, title, body: text });
  return json({ ok: true }, 201);
}
