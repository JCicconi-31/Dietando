import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  // Lettura dei cookie fuori dal try: con Cache Components il prerendering viene
  // interrotto qui e l'eccezione interna di Next non va intercettata.
  await cookies();
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non autenticato." }, { status: 401 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Errore verifica sessione:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}
