/**
 * Telegram operational mirror.
 * DB transaction must succeed independently.
 * If Telegram fails → user operation must NOT fail.
 */

import { FEATURES } from "@/lib/config";

export interface TelegramPayload {
  text: string;
  parseMode?: "HTML" | "Markdown";
}

const queue: TelegramPayload[] = [];
let flushing = false;

export async function notifyTelegram(payload: TelegramPayload): Promise<void> {
  if (!FEATURES.telegram) return;
  queue.push(payload);
  void flushQueue();
}

async function flushQueue() {
  if (flushing) return;
  flushing = true;
  try {
    while (queue.length) {
      const item = queue.shift();
      if (!item) break;
      try {
        await send(item);
      } catch (err) {
        console.error("[telegram] send failed (non-fatal)", err);
        // drop or re-queue once — do not throw to callers
      }
    }
  } finally {
    flushing = false;
  }
}

async function send(payload: TelegramPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: payload.text.slice(0, 4000),
      parse_mode: payload.parseMode || "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram HTTP ${res.status}: ${body.slice(0, 200)}`);
  }
}

export function telegramNewUser(email: string) {
  return notifyTelegram({ text: `👤 New user: ${email}` });
}

export function telegramPayment(orderId: string, amount: number, credits: number) {
  return notifyTelegram({
    text: `💳 Payment success\nOrder: ${orderId}\nAmount: ₹${amount}\nCredits: +${credits}`,
  });
}

export function telegramAbuse(signal: string) {
  return notifyTelegram({ text: `⚠️ Abuse signal: ${signal}` });
}
