"use client";

import { useState } from "react";
import { checkBalanceBetPro } from "../lib/api";

function ScaleIcon(props) {
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
      <path d="M12 3v18M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM5 7h14M3 21h18" />
    </svg>
  );
}

function CloseIcon(props) {
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
      <path d="M18 6 6 18M6 6l12 12" />
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

export default function CheckBalanceModal({ sessionId, onClose }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const data = await checkBalanceBetPro({ sessionId, username });
      setResult(data);
    } catch (err) {
      setError(err.message || "Balance check failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#12151C] p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4C8EFF]/10 text-[#4C8EFF]">
              <ScaleIcon className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[#EDEFF3]">
              Check Balance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8B93A3] transition hover:bg-white/5 hover:text-[#EDEFF3]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
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
              className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] outline-none transition focus:border-[#4C8EFF]/60 focus:ring-2 focus:ring-[#4C8EFF]/20"
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
            {loading ? "Checking..." : "Check Balance"}
          </button>
        </form>

        {result && (
          <div className="mt-4 rounded-lg border border-white/[0.08] bg-[#0B0E14] p-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
              <span className="text-xs text-[#8B93A3]">User</span>
              <span className="font-mono text-sm font-medium text-[#EDEFF3]">
                {result.displayName || result.username}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2.5">
              <span className="text-xs text-[#8B93A3]">Balance</span>
              <span className="font-mono text-sm font-semibold text-[#5FE3AC]">
                {result.balance}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
