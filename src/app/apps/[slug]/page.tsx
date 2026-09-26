import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Standalone full-page app route: /apps/<slug>
 *
 * Architecture rules:
 * - NO iframe
 * - NO postMessage bridge
 * - Original HTML is source of truth
 * - SDK injected for action authorization
 *
 * Phase 4 will complete HTML delivery + sandboxing.
 * Phase 1–2: registry lookup + shell.
 */
export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let app: {
    id: string;
    name: string;
    slug: string;
    html_source: string | null;
    status: string;
  } | null = null;

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("apps")
      .select("id, name, slug, html_source, status")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    app = data;
  } catch {
    // DB not configured yet — show placeholder
  }

  if (!app) {
    // Development placeholder until apps are published
    return (
      <html lang="en" data-kaamora-app={slug}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{slug} · Kaamora</title>
          <script src="/sdk/kaamora.js" defer />
        </head>
        <body
          style={{
            fontFamily: "system-ui, sans-serif",
            margin: 0,
            padding: "2rem",
            background: "#fafafa",
            color: "#18181b",
          }}
        >
          <main style={{ maxWidth: 480, margin: "0 auto" }}>
            <p style={{ color: "#4f46e5", fontWeight: 600, fontSize: 14 }}>
              Kaamora
            </p>
            <h1 style={{ fontSize: "1.5rem", margin: "0.5rem 0" }}>
              App: {slug}
            </h1>
            <p style={{ color: "#71717a", fontSize: 14 }}>
              This app is not published yet, or the database is not connected.
              When published, the original HTML source will render here as a
              full-page standalone app with the Kaamora SDK available.
            </p>
            <p style={{ fontSize: 13, color: "#a1a1aa" }}>
              Route: /apps/{slug} · No iframe · Browser processing
            </p>
          </main>
        </body>
      </html>
    );
  }

  // Serve original HTML with SDK injection (Phase 4 hardens this)
  const html = app.html_source || "";
  const injected = injectSdk(html, app.slug);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: injected }}
      suppressHydrationWarning
    />
  );
}

function injectSdk(html: string, slug: string): string {
  const sdkTag = `<script src="/sdk/kaamora.js" defer></script>`;
  const attr = `data-kaamora-app="${slug}"`;

  if (/<html[\s>]/i.test(html)) {
    let out = html.replace(/<html/i, `<html ${attr}`);
    if (/<\/head>/i.test(out)) {
      out = out.replace(/<\/head>/i, `${sdkTag}</head>`);
    } else if (/<\/body>/i.test(out)) {
      out = out.replace(/<\/body>/i, `${sdkTag}</body>`);
    } else {
      out += sdkTag;
    }
    return out;
  }

  return `<!DOCTYPE html><html ${attr}><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>${sdkTag}</head><body>${html}</body></html>`;
}
