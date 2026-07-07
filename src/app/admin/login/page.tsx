"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useHoverSound } from "@/hooks/useHoverSound";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { hoverProps } = useHoverSound(0.05);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      if (email === "admin" && password === "wutshy") {
        router.push("/admin");
        return;
      }
      setError("Demo mode: use admin / wutshy");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#facc15] text-lg font-bold text-black">
            W
          </span>
          <h1 className="mt-4 text-2xl font-bold">WUTSHY Admin</h1>
          <p className="mt-1 text-sm text-white/40">Sign in to manage your site</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-white/50">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/30"
              placeholder="admin@wutshy.com"
              required
            />
          </div>
          <div>
            <label className="text-xs text-white/50">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-white/30"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:opacity-50"
            {...hoverProps}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {!isSupabaseConfigured() && (
          <p className="mt-4 text-center text-xs text-white/30">
            Demo mode: admin / wutshy
          </p>
        )}
      </div>
    </div>
  );
}
