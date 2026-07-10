import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// ---------------------------------------------------------------------------
// Password helpers (bcryptjs — pure JS, works on serverless / Netlify)
// ---------------------------------------------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---------------------------------------------------------------------------
// Session cookie helpers (jose — Edge-compatible JWT)
// ---------------------------------------------------------------------------

const SESSION_COOKIE_NAME = "hypatia_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET ?? "fallback-change-me-in-production";
const SESSION_MAX_AGE = "7d"; // 7 days

/** Keys derived from the session secret (cached between invocations). */
function getSecretKey() {
  return new TextEncoder().encode(SESSION_SECRET);
}

/** Create a signed JWT and return the value that should be set as a cookie. */
export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_MAX_AGE)
    .sign(getSecretKey());
}

/** Verify a JWT token and return the payload (or null if invalid). */
export async function verifySessionToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    // payload.sub is the userId
    if (typeof payload.sub === "string") {
      return { sub: payload.sub };
    }
    return null;
  } catch {
    return null;
  }
}

/** Name of the cookie used for admin sessions. */
export const SESSION_COOKIE_NAME_EXPORT = SESSION_COOKIE_NAME;

/** Cookie attributes used when setting / clearing the session. */
export const SESSION_COOKIE_OPTIONS = {
  name: SESSION_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
