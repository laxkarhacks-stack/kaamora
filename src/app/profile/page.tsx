"use client";

import { useEffect, useState } from "react";
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
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/credits/balance", {
          credentials: "same-origin",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setName(data.profile.name || "");
            setEmail(data.profile.email || "");
            setMobile(data.profile.mobile || "");
            setCity(data.profile.city || "");
          }
        }
      } catch {
        /* ignore */
      }
    })();
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, mobile, city }),
      });
      if (!res.ok) {
        setStatus("Could not save (login required)");
        return;
      }
      setStatus("Saved");
      await refresh();
    } catch {
      setStatus("Network error");
    }
  }

  return (
    <Shell>
      <div className="mx-auto w-full max-w-lg space-y-6 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        {!user && (
          <p className="text-sm text-amber-600">
            Not logged in.{" "}
            <Link href="/auth/login" className="underline">
              Log in
            </Link>
          </p>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>One global session across all apps</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-3">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email" value={email} disabled />
              <Input
                label="Mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Button type="submit">Save</Button>
              {status && <p className="text-sm text-zinc-500">{status}</p>}
            </form>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/credits" className="text-indigo-600 hover:underline">
                Credits
              </Link>
              <Link href="/history" className="text-indigo-600 hover:underline">
                Usage history
              </Link>
              <Link href="/buy-credits" className="text-indigo-600 hover:underline">
                Buy credits
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
