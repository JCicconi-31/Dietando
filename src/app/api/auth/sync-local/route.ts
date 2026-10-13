import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { users } = body;

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let syncedCount = 0;

    for (const u of users) {
      if (!u.email) continue;
      const email = String(u.email).trim().toLowerCase();
      const name = String(u.name || "").trim() || email.split("@")[0];
      const passwordHash = String(u.passwordHash || "");

      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { name }],
        },
      });

      if (!existing) {
        await prisma.user.create({
          data: {
            id: typeof u.id === "string" && u.id.length > 5 ? u.id : undefined,
            email,
            name,
            passwordHash: passwordHash || null,
          },
        });
        syncedCount++;
      } else if (!existing.passwordHash && passwordHash) {
        // Se non aveva password sul server ma ce l'ha in locale
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash },
        });
        syncedCount++;
      }
    }

    return NextResponse.json({ success: true, syncedCount });
  } catch (error) {
    console.error("Errore sync-local utenti:", error);
    return NextResponse.json(
      { success: false, error: "Errore durante la sincronizzazione." },
      { status: 500 }
    );
  }
}
