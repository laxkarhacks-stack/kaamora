/**
 * GitHub stores/syncs current app HTML source.
 * No version-management UI. Credentials never exposed to admin UI.
 * On sync failure → do not silently half-publish.
 */

import { FEATURES } from "@/lib/config";

export interface GitHubSyncResult {
  ok: boolean;
  path?: string;
  sha?: string;
  error?: string;
}

function config() {
  return {
    token: process.env.GITHUB_TOKEN || "",
    owner: process.env.GITHUB_OWNER || "",
    repo: process.env.GITHUB_REPO || "",
  };
}

export function isGitHubConfigured(): boolean {
  const c = config();
  return Boolean(FEATURES.githubSync && c.token && c.owner && c.repo);
}

/**
 * Upsert app HTML at apps/<slug>/index.html
 */
export async function syncAppHtml(
  slug: string,
  html: string
): Promise<GitHubSyncResult> {
  if (!isGitHubConfigured()) {
    return { ok: false, error: "GitHub sync not configured" };
  }

  const { token, owner, repo } = config();
  const path = `apps/${slug}/index.html`;
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  let sha: string | undefined;
  try {
    const existing = await fetch(api, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (existing.ok) {
      const body = (await existing.json()) as { sha?: string };
      sha = body.sha;
    }
  } catch {
    // continue — create new
  }

  const content = Buffer.from(html, "utf8").toString("base64");

  const res = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: `sync: ${slug}`,
      content,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `GitHub ${res.status}: ${text.slice(0, 300)}`,
    };
  }

  const body = (await res.json()) as { content?: { sha?: string; path?: string } };
  return {
    ok: true,
    path: body.content?.path || path,
    sha: body.content?.sha,
  };
}
