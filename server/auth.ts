import { SignJWT, jwtVerify } from "jose";
import type { Context, Next } from "hono";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-insecure-secret-change-me",
);
const ALG = "HS256";

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await Bun.password.verify(password, hash);
  } catch {
    return false;
  }
}

export async function signToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: [ALG] });
    return (payload.sub as string) || null;
  } catch {
    return null;
  }
}

// Hono middleware. Rejects requests without a valid Bearer token and stashes the
// authenticated user id on the context for downstream handlers.
export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const userId = token ? await verifyToken(token) : null;
  if (!userId) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", userId);
  await next();
}
