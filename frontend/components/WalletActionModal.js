"use client";

import { useState } from "react";
import { depositBetPro, withdrawBetPro } from "../lib/api";

function DepositIcon(props) {
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
      <path d="M12 5v14M18 13l-6 6-6-6" />
    </svg>
  );
}

function WithdrawIcon(props) {
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
      <path d="M12 19V5M6 11l6-6 6 6" />
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

export default function WalletActionModal({ mode, sessionId, onClose }) {
  const isDeposit = mode === "deposit";

  const [targetUsername, setTargetUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const accent = isDeposit ? "#1FCB84" : "#F5A93F";
  const Icon = isDeposit ? DepositIcon : WithdrawIcon;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const action = isDeposit ? depositBetPro : withdrawBetPro;
      const data = await action({
        sessionId,
        targetUsername,
        amount,
        description,
      });

      setSuccess(data.message || "Success");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#12151C] p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${accent}1A`, color: accent }}
            >
              <Icon className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[#EDEFF3]">
              {isDeposit ? "Deposit" : "Withdraw"}
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
              Target Username
            </label>
            <input
              type="text"
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8B93A3]">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 font-mono text-sm text-[#EDEFF3] placeholder:text-[#4A5261] outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8B93A3]">
              Description{" "}
              <span className="normal-case text-[#5C6474]">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] outline-none transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-[#FF5C68]/20 bg-[#FF5C68]/10 px-3 py-2 text-xs text-[#FF8892]">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-[#1FCB84]/20 bg-[#1FCB84]/10 px-3 py-2 text-xs text-[#5FE3AC]">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? `${accent}66` : accent,
            }}
          >
            {loading && <Spinner className="h-4 w-4" />}
            {loading
              ? "Processing..."
              : isDeposit
                ? "Submit Deposit"
                : "Submit Withdraw"}
          </button>
        </form>
      </div>
    </div>
  );
}
