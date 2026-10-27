import { COMMERCE } from "@/config/site";
import { createSession, findUserByEmail, getUser, orderToken, rateLimit, registerUser } from "@/lib/auth";
import { body, clientIp, fail, json, sameOrigin } from "@/lib/http";
import { createOrder, expireStaleOrders, newOrderNumber, OrderError } from "@/lib/orders";
import { createRazorpayOrder, razorpayEnabled, razorpayKeyId } from "@/lib/payments";
import { quote } from "@/lib/pricing";
import { isEmail, isPhone, isPin } from "@/lib/utils";

interface CheckoutBody {
  items?: any[];
  coupon?: string;
  paymentMethod?: string;
  email?: string;
  phone?: string;
  address?: { fullName?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string };
  account?: { password?: string };
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Cross-site request blocked.", 403);
  if (!rateLimit(`checkout:${clientIp(req)}`, 20, 10 * 60_000)) return fail("Too many attempts. Please wait a few minutes.", 429);
  const b = await body<CheckoutBody>(req);
  if (!b || !Array.isArray(b.items)) return fail("Invalid request.");

  const method = b.paymentMethod === "cod" ? "cod" : b.paymentMethod === "razorpay" ? "razorpay" : null;
  if (!method) return fail("Choose a payment method.");

  const email = (b.email ?? "").trim().toLowerCase();
  const phone = (b.phone ?? "").replace(/\s/g, "");
  const a = b.address ?? {};
  const address = {
    fullName: (a.fullName ?? "").trim(), line1: (a.line1 ?? "").trim(), line2: (a.line2 ?? "").trim() || undefined,
    city: (a.city ?? "").trim(), state: (a.state ?? "").trim(), pincode: (a.pincode ?? "").trim(),
  };
  if (!isEmail(email)) return fail("Enter a valid email address.", 400, { field: "email" });
  if (!isPhone(phone)) return fail("Enter a valid 10-digit mobile number.", 400, { field: "phone" });
  if (address.fullName.length < 2) return fail("Enter the recipient's full name.", 400, { field: "fullName" });
  if (address.line1.length < 5) return fail("Enter your street address.", 400, { field: "line1" });
  if (address.city.length < 2) return fail("Enter your city.", 400, { field: "city" });
  if (!address.state) return fail("Select your state.", 400, { field: "state" });
  if (!isPin(address.pincode)) return fail("Enter a valid 6-digit PIN code.", 400, { field: "pincode" });

  expireStaleOrders();
  const q = quote(b.items, b.coupon, method);
  if (!q.lines.length) return fail("Your bag is empty.");
  if (!q.ok) return fail("Some items are no longer available in the quantity requested. Please review your bag.", 409, { quote: q });
  if (b.coupon?.trim() && q.couponError) return fail(q.couponError, 400, { field: "coupon" });
  if (method === "cod" && q.subtotal - q.discount > COMMERCE.codMaxOrder) {
    return fail(`Cash on Delivery is available up to ₹${COMMERCE.codMaxOrder.toLocaleString("en-IN")}. Please pay online.`);
  }
  if (method === "razorpay" && !razorpayEnabled()) {
    return fail("Online payments are not set up on this store yet. Please choose Cash on Delivery.", 503);
  }

  // Account: either already signed in, or optionally create one during checkout.
  let user = await getUser();
  const password = b.account?.password;
  let userId = user?.id ?? null;
  if (!user && password) {
    if (password.length < 8 || password.length > 128) return fail("Password must be at least 8 characters.", 400, { field: "password" });
    if (findUserByEmail(email)) return fail("An account with this email already exists. Sign in first, or uncheck “Create an account”.", 409, { field: "email" });
  }

  const number = newOrderNumber();
  let razorpayOrderId: string | undefined;
  if (method === "razorpay") {
    try {
      razorpayOrderId = (await createRazorpayOrder(q.total, number, { order: number })).id;
    } catch (e) {
      console.error("[checkout] Razorpay order creation failed:", e instanceof Error ? e.message : e);
      return fail("We couldn't start the payment. Please try again or choose Cash on Delivery.", 502);
    }
  }

  if (!user && password) {
    userId = await registerUser({ name: address.fullName, email, password, phone });
    await createSession(userId);
  }

  try {
    const order = createOrder({
      number, items: b.items, coupon: b.coupon, paymentMethod: method, email, phone, address, userId,
      razorpayOrderId, expectedTotal: q.total,
    });
    return json(
      {
        number: order.number,
        token: orderToken(order.number),
        payment: method === "razorpay"
          ? { keyId: razorpayKeyId(), razorpayOrderId, amount: q.total * 100, currency: "INR" }
          : null,
      },
      201,
    );
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409, { code: e.code, quote: quote(b.items, b.coupon, method) });
    console.error("[checkout] createOrder failed:", e);
    return fail("Something went wrong placing your order. You have not been charged. Please try again.", 500);
  }
}
