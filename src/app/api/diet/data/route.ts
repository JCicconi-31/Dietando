import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId obbligatorio." }, { status: 400 });
    }

    const dietData = await prisma.userDietData.findUnique({
      where: { userId },
    });

    if (!dietData) {
      return NextResponse.json({ success: true, data: null });
    }

    const safeParse = (str: string | null) => {
      if (!str) return null;
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    };

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
    const body = await req.json();
    const { userId, plan, selections, purchased, settings } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId obbligatorio." }, { status: 400 });
    }

    // Assicurati che l'utente esista in User
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: "Utente non trovato." }, { status: 404 });
    }

    const updateData: Record<string, string | null> = {};
    if (plan !== undefined) updateData.planData = plan ? JSON.stringify(plan) : null;
    if (selections !== undefined) updateData.selections = selections ? JSON.stringify(selections) : null;
    if (purchased !== undefined) updateData.purchased = purchased ? JSON.stringify(purchased) : null;
    if (settings !== undefined) updateData.settings = settings ? JSON.stringify(settings) : null;

    const saved = await prisma.userDietData.upsert({
      where: { userId },
      create: {
        userId,
        planData: plan ? JSON.stringify(plan) : null,
        selections: selections ? JSON.stringify(selections) : null,
        purchased: purchased ? JSON.stringify(purchased) : null,
        settings: settings ? JSON.stringify(settings) : null,
      },
      update: updateData,
    });

    return NextResponse.json({ success: true, updatedAt: saved.updatedAt });
  } catch (error) {
    console.error("Errore salvataggio UserDietData:", error);
    return NextResponse.json({ success: false, error: "Errore server" }, { status: 500 });
  }
}
