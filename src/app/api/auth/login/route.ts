import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { emailOrName, password } = body;

    const query = typeof emailOrName === "string" ? emailOrName.trim() : "";
    const trimmedPassword = typeof password === "string" ? password.trim() : "";

    if (!query || !trimmedPassword) {
      return NextResponse.json(
        { success: false, error: "Inserisci sia email/nome utente che la password." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: query, mode: "insensitive" } },
          { name: { equals: query, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Nessun account trovato con queste credenziali." },
        { status: 401 }
      );
    }

    let isMatch = false;

    if (user.passwordHash) {
      if (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$")) {
        isMatch = await bcrypt.compare(trimmedPassword, user.passwordHash);
      } else {
        // Fallback hashing client-side legacy SHA-256
        const legacyHash = crypto
          .createHash("sha256")
          .update(trimmedPassword + "_diet_salt_2026")
          .digest("hex");

        if (user.passwordHash === legacyHash) {
          isMatch = true;
          // Migra automaticamente a bcrypt
          const newBcryptHash = await bcrypt.hash(trimmedPassword, 10);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newBcryptHash },
          });
        }
      }
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Password errata. Riprova." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || query,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Errore login utente:", error);
    return NextResponse.json(
      { success: false, error: "Si è verificato un errore durante il login." },
      { status: 500 }
    );
  }
}
