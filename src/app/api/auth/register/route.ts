import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: "Tutti i campi (nome, email, password) sono obbligatori." },
        { status: 400 }
      );
    }

    if (trimmedPassword.length < 4) {
      return NextResponse.json(
        { success: false, error: "La password deve contenere almeno 4 caratteri." },
        { status: 400 }
      );
    }

    // Controlla se esiste già un utente con questa email o nome
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmedEmail, mode: "insensitive" } },
          { name: { equals: trimmedName, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Un account con questa email o questo nome utente esiste già.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(trimmedPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name || trimmedName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Errore registrazione utente:", error);
    return NextResponse.json(
      { success: false, error: "Si è verificato un errore durante la registrazione." },
      { status: 500 }
    );
  }
}
