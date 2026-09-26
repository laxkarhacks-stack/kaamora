import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { telegramNewUser } from "@/lib/telegram/notify";
import { emitEvent } from "@/lib/engine/events";
import { DEFAULTS } from "@/lib/config";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { name: parsed.data.name },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (data.user) {
      const service = createServiceClient();
      await service.from("profiles").upsert({
        id: data.user.id,
        name: parsed.data.name,
        email: parsed.data.email,
        status: "active",
      });
      await service.from("credits").upsert({
        user_id: data.user.id,
        balance: DEFAULTS.accountTrialBonusCredits,
      });
      void telegramNewUser(parsed.data.email);
      void emitEvent({ type: "signup", userId: data.user.id });
    }

    return NextResponse.json({
      ok: true,
      userId: data.user?.id,
      needsEmailConfirm: !data.session,
    });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
