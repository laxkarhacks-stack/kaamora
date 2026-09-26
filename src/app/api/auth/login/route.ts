import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { emitEvent } from "@/lib/engine/events";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (data.user) {
      const service = createServiceClient();
      await service
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", data.user.id);
      void emitEvent({ type: "login", userId: data.user.id });
    }

    return NextResponse.json({ ok: true, userId: data.user?.id });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
