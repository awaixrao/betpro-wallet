"use client";

import { useState } from "react";
import { createUserBetPro } from "../lib/api";

function UserPlusIcon(props) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
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

export default function CreateUserModal({ sessionId, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await createUserBetPro({ sessionId, username, password });
      setSuccess(data.message || "User created successfully.");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || "Create user failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#12151C] p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#9B6BFF]/10 text-[#9B6BFF]">
              <UserPlusIcon className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-semibold tracking-tight text-[#EDEFF3]">
              Create User
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
              className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] outline-none transition focus:border-[#9B6BFF]/60 focus:ring-2 focus:ring-[#9B6BFF]/20"
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
              className="w-full rounded-lg border border-white/10 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-[#EDEFF3] outline-none transition focus:border-[#9B6BFF]/60 focus:ring-2 focus:ring-[#9B6BFF]/20"
              required
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
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#9B6BFF] py-2.5 text-sm font-medium text-white transition hover:bg-[#8A57F5] disabled:cursor-not-allowed disabled:bg-[#9B6BFF]/40"
          >
            {loading && <Spinner className="h-4 w-4" />}
            {loading ? "Creating..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
