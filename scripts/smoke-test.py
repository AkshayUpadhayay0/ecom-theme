#!/usr/bin/env python3
"""End-to-end API smoke test. Usage: python3 scripts/smoke-test.py http://localhost:3100
Needs the server running with RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET=testsecret for the payment-guard checks."""
import hashlib, hmac, http.cookiejar, json, sqlite3, sys, urllib.request, urllib.error

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3100"
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
fails = 0

# start from a clean slate for the test identities (safe to re-run)
_c = sqlite3.connect("data/store.db")
_c.execute("delete from users where email = 'asha@example.com'")
_c.execute("delete from orders where email in ('buyer@example.com','t@e.com')")
_c.commit(); _c.close()

def call(method, path, data=None, raw=None, headers=None):
    body = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    req = urllib.request.Request(BASE + path, data=body, method=method, headers={"Content-Type": "application/json", **(headers or {})})
    try:
        r = opener.open(req)
        txt = r.read()
        try: return r.status, json.loads(txt or b"{}")
        except Exception: return r.status, {"raw": txt.decode()[:200]}
    except urllib.error.HTTPError as e:
        txt = e.read()
        try: return e.code, json.loads(txt)
        except Exception: return e.code, {"raw": txt.decode()[:200]}

def check(name, cond, extra=""):
    global fails
    print(("PASS " if cond else "FAIL ") + name + (f"  [{extra}]" if extra and not cond else ""))
    if not cond: fails += 1

_, cat = call("GET", "/api/products")
prods = {p["slug"]: p for p in cat["products"]}
check("catalogue has 27 products", cat["count"] == 27, cat["count"])

def pick(slug, min_stock=5):
    p = prods[slug]
    v = next(v for v in p["variants"] if v["stock"] >= min_stock)
    return p, v

# --- search
_, s = call("GET", "/api/search?q=tshirt")
check("search synonym 'tshirt' finds tees", any("Tee" in p["name"] for p in s["products"]), [p["name"] for p in s["products"]])
_, s = call("GET", "/api/search?q=camel%20coat")
check("multi-word search ranks coat", s["products"] and s["products"][0]["slug"] == "longline-wool-coat", [p["name"] for p in s["products"]])
_, s = call("GET", "/api/search?q=zzzz")
check("no-match search is empty", s["total"] == 0)
_, f = call("GET", "/api/products?sale=1&sort=price-desc")
check("sale filter only returns discounted", all(p["onSale"] for p in f["products"]) and f["count"] > 0)
_, f = call("GET", "/api/products?size=XXL&stock=1")
check("size+stock filter works", f["count"] > 0 and all(any(v["size"] == "XXL" and v["stock"] > 0 for v in p["variants"]) for p in f["products"]))

# --- pricing: prices come from the server, not the client
tee, tv = pick("heavyweight-boxy-tee")
hood, hv = pick("essential-zip-hoodie")
items = [{"productId": tee["id"], "color": tv["color"], "size": tv["size"], "qty": 2, "price": 1}, {"productId": hood["id"], "color": hv["color"], "size": hv["size"], "qty": 1}]
_, q = call("POST", "/api/quote", {"items": items})
check("quote ignores client-sent price", q["subtotal"] == 2 * tee["price"] + hood["price"], q["subtotal"])
check("shipping free above threshold", q["shipping"] == 0 and q["subtotal"] >= 2999)
_, q1 = call("POST", "/api/quote", {"items": [{**items[0], "qty": 1}]})
check("shipping charged below threshold", q1["shipping"] == 99 and q1["freeShippingRemaining"] == 2999 - q1["subtotal"], q1)
_, qc = call("POST", "/api/quote", {"items": items, "coupon": "welcome10"})
check("WELCOME10 percent capped", qc["discount"] == min(qc["subtotal"] // 10, 1000), qc["discount"])
_, qb = call("POST", "/api/quote", {"items": [items[0]], "coupon": "MAISON500"})
check("coupon below minimum explains why", qb["discount"] == 0 and "more to use" in (qb.get("couponError") or ""), qb.get("couponError"))
_, qx = call("POST", "/api/quote", {"items": items, "coupon": "NOPE"})
check("invalid coupon rejected", qx["discount"] == 0 and qx.get("couponError"))
_, qcod = call("POST", "/api/quote", {"items": items, "paymentMethod": "cod"})
check("COD fee added", qcod["codFee"] == 40 and qcod["total"] == q["total"] + 40)
low = next((p, v) for p in cat["products"] for v in p["variants"] if 1 <= v["stock"] <= 4)
_, qs = call("POST", "/api/quote", {"items": [{"productId": low[0]["id"], "color": low[1]["color"], "size": low[1]["size"], "qty": 10}]})
check("quantity above stock flagged", not qs["ok"] and "left" in (qs["lines"][0].get("problem") or ""), qs["lines"])
sold = next((p, v) for p in cat["products"] for v in p["variants"] if v["stock"] == 0)
_, qz = call("POST", "/api/quote", {"items": [{"productId": sold[0]["id"], "color": sold[1]["color"], "size": sold[1]["size"], "qty": 1}]})
check("sold-out variant flagged", not qz["ok"] and qz["lines"][0].get("problem") == "Sold out", qz["lines"])

addr = {"fullName": "Test Buyer", "line1": "12 MG Road, Indiranagar", "city": "Bengaluru", "state": "Karnataka", "pincode": "560038"}
base = {"items": items, "email": "buyer@example.com", "phone": "9876543210", "address": addr}

# --- checkout validation
st, r = call("POST", "/api/checkout", {**base, "paymentMethod": "cod", "address": {**addr, "pincode": "123"}})
check("bad PIN rejected", st == 400 and r.get("field") == "pincode", r)
st, r = call("POST", "/api/checkout", {**base, "paymentMethod": "cod", "phone": "12345"})
check("bad phone rejected", st == 400 and r.get("field") == "phone", r)
st, r = call("POST", "/api/checkout", {**base, "paymentMethod": "razorpay"})
check("online payment fails safely (no live Razorpay here), no order created", st in (502, 503), (st, r))
st, r = call("POST", "/api/checkout", {**base, "paymentMethod": "cod"}, headers={"Origin": "https://evil.example"})
check("cross-origin checkout blocked", st == 403, st)

# --- COD order + stock decrement
before = next(v for v in call("GET", "/api/products")[1]["products"] if v["id"] == tee["id"])["variants"]
st, r = call("POST", "/api/checkout", {**base, "paymentMethod": "cod", "coupon": "WELCOME10"})
check("COD checkout creates order", st == 201 and r["number"].startswith("MN-") and r["payment"] is None, (st, r))
num = r.get("number")
after = next(v for v in call("GET", "/api/products")[1]["products"] if v["id"] == tee["id"])["variants"]
b = next(v for v in before if v["color"] == tv["color"] and v["size"] == tv["size"])["stock"]
a = next(v for v in after if v["color"] == tv["color"] and v["size"] == tv["size"])["stock"]
check("stock decremented by qty", a == b - 2, (b, a))

# --- overselling is impossible
last = next(v for p in cat["products"] for v in p["variants"] if v["stock"] == 1)
lp = next(p for p in cat["products"] if any(x is last for x in p["variants"]))
one = [{"productId": lp["id"], "color": last["color"], "size": last["size"], "qty": 1}]
s1, _ = call("POST", "/api/checkout", {**base, "items": one, "paymentMethod": "cod"})
s2, r2 = call("POST", "/api/checkout", {**base, "items": one, "paymentMethod": "cod"})
check("last unit sells once, second buyer refused", s1 == 201 and s2 == 409, (s1, s2, r2.get("error")))

# --- accounts
st, r = call("POST", "/api/auth/register", {"name": "Asha Verma", "email": "asha@example.com", "password": "short"})
check("weak password rejected", st == 400)
st, r = call("POST", "/api/auth/register", {"name": "Asha Verma", "email": "asha@example.com", "password": "correct horse battery"})
check("register works and signs in", st == 201)
st, me = call("GET", "/api/auth/me")
check("session cookie recognised", me["user"] and me["user"]["email"] == "asha@example.com")
st, _ = call("POST", "/api/auth/register", {"name": "Asha Verma", "email": "ASHA@example.com", "password": "correct horse battery"})
check("duplicate email (case-insensitive) rejected", st == 409)
call("POST", "/api/auth/logout", {})
check("logout clears session", call("GET", "/api/auth/me")[1]["user"] is None)
st, _ = call("POST", "/api/auth/login", {"email": "asha@example.com", "password": "wrong password!"})
check("wrong password rejected", st == 401)
st, _ = call("POST", "/api/auth/login", {"email": "asha@example.com", "password": "correct horse battery"})
check("login works", st == 200)

# --- wishlist & reviews (signed in)
st, w = call("POST", "/api/wishlist", {"productId": tee["id"], "on": True})
check("wishlist add", st == 200 and tee["id"] in w["ids"])
st, w = call("POST", "/api/wishlist", {"productId": tee["id"], "on": False})
check("wishlist remove", st == 200 and tee["id"] not in w["ids"])
st, _ = call("POST", "/api/reviews", {"productId": tee["id"], "rating": 5, "title": "Great tee", "body": "Heavy, boxy and exactly as pictured."})
check("review accepted", st == 201)
st, _ = call("POST", "/api/reviews", {"productId": tee["id"], "rating": 9, "title": "x", "body": "y"})
check("invalid review rejected", st == 400)

# --- checkout as signed-in user links order to account
st, r = call("POST", "/api/checkout", {**base, "items": [items[1]], "paymentMethod": "cod"})
check("signed-in checkout works", st == 201, (st, r))

# --- payment verification guard: orders only become paid with a valid HMAC
db = sqlite3.connect("data/store.db")
db.execute("""INSERT INTO orders (number,email,phone,status,payment_method,payment_status,razorpay_order_id,subtotal,discount,shipping,cod_fee,total,address,created_at)
              VALUES ('MN-TESTPAY1','t@e.com','9876543210','awaiting_payment','razorpay','pending','order_TEST123',1000,0,99,0,1099,'{}',datetime('now'))""")
db.commit()
sig_ok = hmac.new(b"testsecret", b"order_TEST123|pay_ABC", hashlib.sha256).hexdigest()
st, r = call("POST", "/api/checkout/verify", {"number": "MN-TESTPAY1", "razorpay_order_id": "order_TEST123", "razorpay_payment_id": "pay_ABC", "razorpay_signature": "deadbeef"})
check("forged signature rejected", st == 400, (st, r))
status = db.execute("select payment_status from orders where number='MN-TESTPAY1'").fetchone()[0]
check("order still unpaid after forged signature", status == "pending", status)
st, r = call("POST", "/api/checkout/verify", {"number": "MN-TESTPAY1", "razorpay_order_id": "order_OTHER", "razorpay_payment_id": "pay_ABC", "razorpay_signature": sig_ok})
check("signature for a different order id rejected", st == 404, (st, r))
st, r = call("POST", "/api/checkout/verify", {"number": "MN-TESTPAY1", "razorpay_order_id": "order_TEST123", "razorpay_payment_id": "pay_ABC", "razorpay_signature": sig_ok})
status = db.execute("select payment_status,status from orders where number='MN-TESTPAY1'").fetchone()
check("valid signature marks order paid", st == 200 and status == ("paid", "confirmed"), (st, r, status))
body = json.dumps({"event": "payment.captured", "payload": {"payment": {"entity": {"id": "pay_W", "order_id": "order_WH1", "amount": 50000}}}}).encode()
db.execute("""INSERT INTO orders (number,email,phone,status,payment_method,payment_status,razorpay_order_id,subtotal,discount,shipping,cod_fee,total,address,created_at)
              VALUES ('MN-TESTPAY2','t@e.com','9876543210','awaiting_payment','razorpay','pending','order_WH1',500,0,0,0,500,'{}',datetime('now'))""")
db.commit()
st, _ = call("POST", "/api/webhooks/razorpay", raw=body, headers={"X-Razorpay-Signature": "bad"})
check("webhook with bad signature rejected", st == 400)
good = hmac.new(b"testwebhook", body, hashlib.sha256).hexdigest()
st, _ = call("POST", "/api/webhooks/razorpay", raw=body, headers={"X-Razorpay-Signature": good})
status = db.execute("select payment_status from orders where number='MN-TESTPAY2'").fetchone()[0]
check("signed webhook marks order paid", st == 200 and status == "paid", (st, status))
db.execute("delete from orders where number like 'MN-TESTPAY%'"); db.commit()

print(f"\n{'ALL PASSED' if not fails else str(fails) + ' FAILED'}")
sys.exit(1 if fails else 0)
