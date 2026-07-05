"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginBetPro } from "../lib/api";

function LockIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function Spinner(props) {
  return (
    <svg className="animate-spin" viewBox="0 0 24 24" fill="none" {...props}>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginBetPro({ username, password });
      sessionStorage.setItem("sessionId", data.sessionId);
      sessionStorage.setItem("username", data.username);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#12151C]/90 backdrop-blur-xl shadow-2xl shadow-black/50 p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4C8EFF]/15 text-[#4C8EFF]">
          <LockIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[#EDEFF3]">
            BetPro Agent Terminal
          </h1>
          <p className="font-mono text-xs text-[#8B93A3]">
            secure agent session
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8B93A3]">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] placeholder:text-[#4A5261] outline-none transition focus:border-[#4C8EFF]/60 focus:ring-2 focus:ring-[#4C8EFF]/20"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8B93A3]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] placeholder:text-[#4A5261] outline-none transition focus:border-[#4C8EFF]/60 focus:ring-2 focus:ring-[#4C8EFF]/20"
            required
          />
        </div>

        {error && (
          <div className="rounded-lg border border-[#FF5C68]/20 bg-[#FF5C68]/10 px-3 py-2 text-xs text-[#FF8892]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4C8EFF] py-2.5 text-sm font-medium text-white transition hover:bg-[#3B7DFF] disabled:cursor-not-allowed disabled:bg-[#4C8EFF]/40"
        >
          {loading && <Spinner className="h-4 w-4" />}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
