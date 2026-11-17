import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, getSessionUser } from "@/lib/auth";

/**
 * Elimina definitivamente l'account dell'utente autenticato e tutti i dati collegati
 * (le relazioni Prisma usano onDelete: Cascade).
 */
export async function DELETE() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non autenticato." }, { status: 401 });
    }

    await prisma.user.delete({ where: { id: user.id } });
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Errore eliminazione account:", error);
    return NextResponse.json(
      { success: false, error: "Impossibile eliminare l'account. Riprova." },
      { status: 500 }
    );
  }
}
