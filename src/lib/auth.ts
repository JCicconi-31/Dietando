import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

interface SessionPayload {
  sub: string;
  exp: number;
}

export const SESSION_COOKIE_NAME = "diet_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 giorni

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET mancante o troppo corto (minimo 32 caratteri).");
  }
  return DEV_FALLBACK_SECRET;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/**
 * Crea un token di sessione firmato HMAC-SHA256: `<payload base64url>.<firma>`.
 * Il payload contiene solo l'id utente e la scadenza.
 */
export function createSessionToken(
  userId: string,
  secret: string = getSecret(),
  now: number = Date.now()
): string {
  const payload: SessionPayload = { sub: userId, exp: now + SESSION_MAX_AGE_SECONDS * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded, secret)}`;
}

/**
 * Verifica firma e scadenza del token. Restituisce l'id utente o null.
 */
export function verifySessionToken(
  token: string | undefined | null,
  secret: string = getSecret(),
  now: number = Date.now()
): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts;

  const expected = Buffer.from(sign(encoded, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as SessionPayload;
    if (typeof payload.sub !== "string" || typeof payload.exp !== "number") return null;
    if (now > payload.exp) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

/**
 * Imposta il cookie di sessione (solo in Route Handler o Server Function).
 */
export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Legge il cookie, verifica la firma e controlla che l'utente esista ancora.
 * Da chiamare in ogni Route Handler che accede a dati personali.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userId = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) return null;

  return { id: user.id, email: user.email, name: user.name || user.email.split("@")[0] };
}
