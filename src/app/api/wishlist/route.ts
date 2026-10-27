import { getUser } from "@/lib/auth";
import { body, fail, json, sameOrigin } from "@/lib/http";
import { getWishlistIds, setWishlist } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUser();
  return json({ ids: user ? getWishlistIds(user.id) : [] });
}

/** POST { productId, on } toggles one item; POST { merge: [ids] } adds many (used after sign-in). */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  const user = await getUser();
  if (!user) return fail("Sign in to sync your wishlist.", 401);
  const b = await body<{ productId?: number; on?: boolean; merge?: number[] }>(req);
  if (!b) return fail("Invalid request.");
  if (Array.isArray(b.merge)) {
    for (const id of b.merge.slice(0, 200)) if (Number.isInteger(id)) setWishlist(user.id, id, true);
  } else if (Number.isInteger(b.productId)) {
    setWishlist(user.id, b.productId!, b.on !== false);
  } else return fail("Invalid request.");
  return json({ ids: getWishlistIds(user.id) });
}
