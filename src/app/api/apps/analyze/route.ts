import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeHtml } from "@/lib/analyzer/html-analyzer";

const Schema = z.object({
  html: z.string().min(1).max(5_000_000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid HTML payload" }, { status: 400 });
    }
    const analysis = analyzeHtml(parsed.data.html);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
