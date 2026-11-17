import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { DietDataSchema, MAX_DIET_PAYLOAD_BYTES } from "@/lib/api-schemas";

const unauthorized = () =>
  NextResponse.json({ success: false, error: "Non autenticato." }, { status: 401 });

function safeParse(str: string | null) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export async function GET() {
  // Fuori dal try: con Cache Components il prerendering si interrompe qui.
  await cookies();
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const dietData = await prisma.userDietData.findUnique({ where: { userId: user.id } });
    if (!dietData) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: safeParse(dietData.planData),
        selections: safeParse(dietData.selections) || {},
        purchased: safeParse(dietData.purchased) || {},
        settings: safeParse(dietData.settings) || {},
        updatedAt: dietData.updatedAt,
      },
    });
  } catch (error) {
    console.error("Errore recupero UserDietData:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return unauthorized();

    const raw = await req.text();
    if (raw.length > MAX_DIET_PAYLOAD_BYTES) {
      return NextResponse.json({ success: false, error: "Dati troppo grandi." }, { status: 413 });
    }

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, error: "JSON non valido." }, { status: 400 });
    }

    const parsed = DietDataSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Formato dati non valido.", issues: parsed.error.issues.slice(0, 5) },
        { status: 400 }
      );
    }
    const { plan, selections, purchased, settings } = parsed.data;

    const toText = (v: unknown) => (v ? JSON.stringify(v) : null);
    const updateData: Record<string, string | null> = {};
    if (plan !== undefined) updateData.planData = toText(plan);
    if (selections !== undefined) updateData.selections = toText(selections);
    if (purchased !== undefined) updateData.purchased = toText(purchased);
    if (settings !== undefined) updateData.settings = toText(settings);

    const saved = await prisma.userDietData.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        planData: toText(plan),
        selections: toText(selections),
        purchased: toText(purchased),
        settings: toText(settings),
      },
      update: updateData,
    });

    return NextResponse.json({ success: true, updatedAt: saved.updatedAt });
  } catch (error) {
    console.error("Errore salvataggio UserDietData:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}
