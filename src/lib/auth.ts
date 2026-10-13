import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

const SESSION_COOKIE_NAME = "diet_session";

// Demo user predefinito per accesso immediato senza configurazione DB complessa
export const DEMO_USER: SessionUser = {
  id: "user-demo-01",
  email: "demo@organizzatore-dieta.it",
  name: "Utente Demo",
};

/**
 * Genera l'hash sicuro della password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifica la password rispetto all'hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Crea o codifica una sessione utente in un token base64 sicuro
 */
export function encodeSession(user: SessionUser): string {
  const payload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 giorni
  };
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Decodifica la sessione verificando la scadenza
 */
export function decodeSession(token: string): SessionUser | null {
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.id || !parsed.exp) return null;
    if (Date.now() > parsed.exp) return null;
    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

/**
 * Recupera l'utente corrente dalla sessione dei cookie (Server Component o Server Action)
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return DEMO_USER; // Di default fornisce la sessione demo per usabilità immediata
  }
  const user = decodeSession(sessionToken);
  return user || DEMO_USER;
}

/**
 * Imposta il cookie di sessione
 */
export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const token = encodeSession(user);
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 giorni
  });
}

/**
 * Rimuove il cookie di sessione (logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
