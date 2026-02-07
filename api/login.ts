import crypto from "node:crypto";

type LoginRequestBody = {
  username?: unknown;
  password?: unknown;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, message: "Method not allowed" }));
    return;
  }

  const body: LoginRequestBody = req.body ?? {};
  const username = asString(body.username);
  const password = asString(body.password);

  const expectedUser = process.env.ADMIN_USER || "cogz";
  const expectedPass = process.env.ADMIN_PASS || "cogz";

  if (!username || !password) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, message: "Missing username or password" }));
    return;
  }

  if (username !== expectedUser || password !== expectedPass) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, message: "Invalid credentials" }));
    return;
  }

  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    sub: username,
    iat: nowSec,
    exp: nowSec + 60 * 60 * 24 * 7,
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", secret).update(payloadB64).digest();
  const token = `${payloadB64}.${base64UrlEncode(sig)}`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: true, token }));
}
