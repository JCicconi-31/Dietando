import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { LoginSchema } from "@/lib/api-schemas";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";

const INVALID_CREDENTIALS = "Credenziali non valide. Controlla email/nome utente e password.";

// Hash fittizio per uniformare i tempi di risposta quando l'utente non esiste.
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash() {
  dummyHashPromise ??= bcrypt.hash("dummy-password-for-timing", 10);
  return dummyHashPromise;
}

export async function POST(req: Request) {
  try {
    const parsed = LoginSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Inserisci sia email/nome utente che la password." },
        { status: 400 }
      );
    }
    const query = parsed.data.emailOrName;
    const password = parsed.data.password.trim();

    const rateKey = `login:${getClientIp(req)}:${query.toLowerCase()}`;
    const limit = checkRateLimit(rateKey, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Troppi tentativi. Riprova tra qualche minuto." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    // L'email ha la precedenza sul nome utente (il nome non è univoco a livello DB).
    const user =
      (await prisma.user.findFirst({ where: { email: { equals: query, mode: "insensitive" } } })) ??
      (await prisma.user.findFirst({
        where: { name: { equals: query, mode: "insensitive" } },
        orderBy: { createdAt: "asc" },
      }));

    let isMatch = false;

    if (user?.passwordHash?.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    } else if (user?.passwordHash) {
      // Hash legacy SHA-256 (account creati dalla vecchia modalità offline): migra a bcrypt.
      // TODO: rimuovere quando non restano più hash legacy nel database.
      const legacyHash = crypto
        .createHash("sha256")
        .update(password + "_diet_salt_2026")
        .digest("hex");
      const a = Buffer.from(legacyHash);
      const b = Buffer.from(user.passwordHash);
      if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
        isMatch = true;
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await bcrypt.hash(password, 10) },
        });
      }
    } else {
      await bcrypt.compare(password, await getDummyHash());
    }

    if (!user || !isMatch) {
      return NextResponse.json({ success: false, error: INVALID_CREDENTIALS }, { status: 401 });
    }

    resetRateLimit(rateKey);
    await setSessionCookie(user.id);

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name || user.email.split("@")[0], email: user.email },
    });
  } catch (error) {
    console.error("Errore login utente:", error);
    return NextResponse.json(
      { success: false, error: "Si è verificato un errore durante il login." },
      { status: 500 }
    );
  }
}
