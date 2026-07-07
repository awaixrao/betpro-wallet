"use client";

import { useState } from "react";
import { getLedgerBetPro } from "../lib/api";

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

function formatAmount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value;
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric}`;
}

// datetime-local input <-> ISO helpers
function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return {
    from: toDatetimeLocalValue(from),
    to: toDatetimeLocalValue(to),
  };
}

export default function LedgerModal({ sessionId, onClose }) {
  const defaultRange = getDefaultRange();

  const [username, setUsername] = useState("");
  const [fromInput, setFromInput] = useState(defaultRange.from);
  const [toInput, setToInput] = useState(defaultRange.to);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ledger, setLedger] = useState(null);

  async function handleGetLedger(e) {
    e.preventDefault();

    if (!username.trim()) {
      setError("Username required hai.");
      return;
    }

    setLoading(true);
    setError("");
    setLedger(null);

    try {
      const result = await getLedgerBetPro({
        sessionId,
        username: username.trim(),
        from: fromInput ? new Date(fromInput).toISOString() : undefined,
        to: toInput ? new Date(toInput).toISOString() : undefined,
      });
      setLedger(result);
    } catch (err) {
      setError(err.message || "Ledger fetch nahi ho saka.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#12151C] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#EDEFF3]">Account Ledger</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#8B93A3] transition hover:bg-white/5 hover:text-[#EDEFF3]"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleGetLedger} className="space-y-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3 py-2 text-sm text-[#EDEFF3] outline-none placeholder:text-[#5C6270] focus:border-[#4C8EFF]/50"
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[#5C6270]">
                From
              </label>
              <input
                type="datetime-local"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3 py-2 text-xs text-[#EDEFF3] outline-none focus:border-[#4C8EFF]/50"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] uppercase tracking-wide text-[#5C6270]">
                To
              </label>
              <input
                type="datetime-local"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3 py-2 text-xs text-[#EDEFF3] outline-none focus:border-[#4C8EFF]/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#4C8EFF] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3A7AEF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get Ledger"}
          </button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}

        {ledger && (
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between text-xs text-[#8B93A3]">
              <span>
                <span className="font-medium text-[#EDEFF3]">
                  {ledger.displayName || ledger.username}
                </span>
              </span>
              <span>
                {ledger.from} &ndash; {ledger.to}
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto rounded-lg border border-white/[0.08]">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#161A23] text-[#8B93A3]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">
                      Description
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Amount</th>
                    <th className="px-3 py-2 text-right font-medium">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.entries?.length ? (
                    ledger.entries.map((entry, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-white/[0.06] text-[#EDEFF3]"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-[#8B93A3]">
                          {entry.date}
                        </td>
                        <td className="px-3 py-2">{entry.description}</td>
                        <td
                          className={`px-3 py-2 text-right font-mono ${
                            Number(entry.amount) > 0
                              ? "text-[#1FCB84]"
                              : Number(entry.amount) < 0
                                ? "text-[#F5A93F]"
                                : "text-[#8B93A3]"
                          }`}
                        >
                          {formatAmount(entry.amount)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {entry.balance}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-4 text-center text-[#5C6270]"
                      >
                        No entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {(ledger.openingBalance !== null ||
              ledger.closingBalance !== null) && (
              <div className="mt-3 flex justify-between text-xs text-[#8B93A3]">
                <span>
                  Opening:{" "}
                  <span className="font-mono text-[#EDEFF3]">
                    {ledger.openingBalance}
                  </span>
                </span>
                <span>
                  Closing:{" "}
                  <span className="font-mono text-[#EDEFF3]">
                    {ledger.closingBalance}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
