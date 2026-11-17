import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";
import { RegisterSchema } from "@/lib/api-schemas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit = checkRateLimit(`register:${getClientIp(req)}`, 5, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Troppe registrazioni da questa rete. Riprova più tardi." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const parsed = RegisterSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Dati non validi." },
        { status: 400 }
      );
    }
    const { name, email } = parsed.data;
    const password = parsed.data.password.trim();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: "insensitive" } },
          { name: { equals: name, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Un account con questa email o questo nome utente esiste già." },
        { status: 409 }
      );
    }

    const newUser = await prisma.user.create({
      data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
      select: { id: true, name: true, email: true },
    });

    await setSessionCookie(newUser.id);

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name || name, email: newUser.email },
    });
  } catch (error) {
    console.error("Errore registrazione utente:", error);
    return NextResponse.json(
      { success: false, error: "Si è verificato un errore durante la registrazione." },
      { status: 500 }
    );
  }
}
