"use client";

import { useMemo, useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORIES } from "@/lib/config";

type Analysis = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  modules: Array<{ name: string; category: string; confidence: number }>;
  actions: Array<{
    name: string;
    confidence: number;
    suggestedBillable: boolean;
  }>;
  overallConfidence: number;
};

type ActionConfig = {
  action_name: string;
  billable: boolean;
  cost: number;
};

export default function CreateAppPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Utilities");
  const [description, setDescription] = useState("");
  const [html, setHtml] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [actions, setActions] = useState<ActionConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testCredits, setTestCredits] = useState(10);

  const previewDoc = useMemo(() => {
    if (!html.trim()) return null;
    return html;
  }, [html]);

  async function runAnalyze() {
    setError(null);
    setMessage(null);
    // Client-side quick analyze via API would be better; call create with dry-run later.
    // For now local heuristic is server-side only — POST analyze endpoint.
    try {
      const res = await fetch("/api/apps/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Analyze failed");
        return;
      }
      setAnalysis(data.analysis);
      setActions(
        (data.analysis.actions || []).map(
          (a: { name: string; suggestedBillable: boolean }) => ({
            action_name: a.name,
            billable: !!a.suggestedBillable,
            cost: a.suggestedBillable ? 1 : 0,
          })
        )
      );
      setMessage(
        `Detection Confidence: ${data.analysis.overallConfidence}% (not app quality)`
      );
    } catch {
      setError("Network error during analyze");
    }
  }

  async function publish(asDraft: boolean) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          description,
          category,
          html,
          publish: !asDraft,
          actions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Create failed");
        return;
      }
      setMessage(
        asDraft
          ? `Draft saved: ${data.app.slug}`
          : `Published: /apps/${data.app.slug}`
      );
      setAnalysis(data.analysis);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function simulateCheckAll() {
    // Sandbox test wallet — NOT real user credits
    let bal = 10;
    const lines: string[] = ["Open — Working — Free"];
    for (const a of actions) {
      if (!a.billable || a.cost <= 0) {
        lines.push(`${a.action_name} — Working — Free`);
      } else {
        bal -= a.cost;
        lines.push(
          `${a.action_name} — Working — -${a.cost} (test wallet → ${bal})`
        );
      }
    }
    // Repeated billing demo
    const billable = actions.find((a) => a.billable && a.cost > 0);
    if (billable) {
      for (let i = 1; i <= 3; i++) {
        bal -= billable.cost;
        lines.push(
          `${billable.action_name} #${i} → ${bal} test credits`
        );
      }
    }
    setTestCredits(bal);
    setMessage(lines.join("\n"));
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create App</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Paste or upload HTML. Analyzer shows Detection Confidence. You
            confirm billable actions. No version history.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Source</CardTitle>
              <CardDescription>Original HTML is the source of truth</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Slug (optional)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto from name"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-600 dark:bg-zinc-900"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">HTML</label>
                <textarea
                  className="min-h-[220px] w-full rounded-xl border border-zinc-300 bg-white p-3 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-900"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="<!DOCTYPE html>..."
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={runAnalyze}>
                  Analyze
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => publish(true)}
                  loading={loading}
                  disabled={!name || !html}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  onClick={() => publish(false)}
                  loading={loading}
                  disabled={!name || !html}
                >
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyzer</CardTitle>
                <CardDescription>
                  Detection Confidence — not quality score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {analysis ? (
                  <>
                    <p>
                      Overall confidence:{" "}
                      <strong>{analysis.overallConfidence}%</strong>
                    </p>
                    {analysis.warnings.map((w) => (
                      <p key={w} className="text-amber-600">
                        ⚠ {w}
                      </p>
                    ))}
                    <p className="font-medium">Modules</p>
                    <ul className="list-disc pl-5">
                      {analysis.modules.map((m) => (
                        <li key={m.name}>
                          {m.name} ({m.category}) — {m.confidence}%
                        </li>
                      ))}
                    </ul>
                    <p className="font-medium">Actions (confirm billing)</p>
                    {actions.map((a, i) => (
                      <div
                        key={a.action_name}
                        className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 p-2 dark:border-zinc-700"
                      >
                        <span className="font-mono text-xs">{a.action_name}</span>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={a.billable}
                            onChange={(e) => {
                              const next = [...actions];
                              next[i] = {
                                ...a,
                                billable: e.target.checked,
                                cost: e.target.checked ? a.cost || 1 : 0,
                              };
                              setActions(next);
                            }}
                          />
                          Billable
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="h-8 w-16 rounded border px-2 text-xs"
                          value={a.cost}
                          disabled={!a.billable}
                          onChange={(e) => {
                            const next = [...actions];
                            next[i] = {
                              ...a,
                              cost: Number(e.target.value) || 0,
                            };
                            setActions(next);
                          }}
                        />
                        <span className="text-xs text-zinc-500">credits</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-zinc-500">Run Analyze after pasting HTML.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check All (test wallet)</CardTitle>
                <CardDescription>
                  Test credits = {testCredits} (sandbox, not real user credits)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button type="button" variant="secondary" onClick={simulateCheckAll}>
                  Check All
                </Button>
                {message && (
                  <pre className="whitespace-pre-wrap rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800">
                    {message}
                  </pre>
                )}
                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </CardContent>
            </Card>

            {previewDoc && (
              <Card>
                <CardHeader>
                  <CardTitle>Live preview</CardTitle>
                  <CardDescription>
                    Preview only — production route is full-page /apps/slug (no
                    iframe runtime for published apps)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <iframe
                    title="preview"
                    sandbox="allow-scripts"
                    srcDoc={previewDoc}
                    className="h-64 w-full rounded-xl border border-zinc-200 dark:border-zinc-700"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
