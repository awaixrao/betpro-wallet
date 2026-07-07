"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WalletActionModal from "../../components/WalletActionModal";
import CreateUserModal from "../../components/CreateUserModal";
import CheckBalanceModal from "../../components/CheckBalanceModal";
import LedgerModal from "../../components/LedgerModal";

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

function LedgerIcon(props) {
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
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function LogOutIcon(props) {
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
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCheckBalance, setShowCheckBalance] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    const storedUsername = sessionStorage.getItem("username");

    if (!storedSessionId) {
      router.push("/");
      return;
    }

    setSessionId(storedSessionId);
    setUsername(storedUsername || "");
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("sessionId");
    sessionStorage.removeItem("username");
    router.push("/");
  }

  if (!sessionId) {
    return null;
  }

  const actions = [
    {
      key: "deposit",
      label: "Deposit",
      description: "Credit cash to a user",
      icon: DepositIcon,
      accent: "text-[#1FCB84]",
      accentBg: "bg-[#1FCB84]/10",
      accentBorder: "hover:border-[#1FCB84]/40",
      onClick: () => setModalMode("deposit"),
    },
    {
      key: "withdraw",
      label: "Withdraw",
      description: "Debit cash from a user",
      icon: WithdrawIcon,
      accent: "text-[#F5A93F]",
      accentBg: "bg-[#F5A93F]/10",
      accentBorder: "hover:border-[#F5A93F]/40",
      onClick: () => setModalMode("withdraw"),
    },
    {
      key: "create",
      label: "Create User",
      description: "Add a new downline user",
      icon: UserPlusIcon,
      accent: "text-[#9B6BFF]",
      accentBg: "bg-[#9B6BFF]/10",
      accentBorder: "hover:border-[#9B6BFF]/40",
      onClick: () => setShowCreateUser(true),
    },
    {
      key: "balance",
      label: "Check Balance",
      description: "Look up a user's balance",
      icon: ScaleIcon,
      accent: "text-[#4C8EFF]",
      accentBg: "bg-[#4C8EFF]/10",
      accentBorder: "hover:border-[#4C8EFF]/40",
      onClick: () => setShowCheckBalance(true),
    },
    {
      key: "ledger",
      label: "Ledger",
      description: "View a user's account ledger",
      icon: LedgerIcon,
      accent: "text-[#E85D9C]",
      accentBg: "bg-[#E85D9C]/10",
      accentBorder: "hover:border-[#E85D9C]/40",
      onClick: () => setShowLedger(true),
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#0B0E14] p-4">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-md pt-10">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#12151C]/90 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1FCB84] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1FCB84]" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#8B93A3]">
                Session active
              </p>
              <p className="font-mono text-sm font-medium text-[#EDEFF3]">
                {username}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#8B93A3] transition hover:border-white/20 hover:text-[#EDEFF3]"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {actions.map(
            ({
              key,
              label,
              description,
              icon: Icon,
              accent,
              accentBg,
              accentBorder,
              onClick,
            }) => (
              <button
                key={key}
                onClick={onClick}
                className={`group flex flex-col items-start gap-3 rounded-2xl border border-white/[0.08] bg-[#12151C]/90 p-4 text-left transition hover:-translate-y-0.5 hover:bg-[#161A23] ${accentBorder}`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentBg} ${accent}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#EDEFF3]">{label}</p>
                  <p className="mt-0.5 text-xs text-[#8B93A3]">{description}</p>
                </div>
              </button>
            ),
          )}
        </div>
      </div>

      {modalMode && (
        <WalletActionModal
          mode={modalMode}
          sessionId={sessionId}
          onClose={() => setModalMode(null)}
        />
      )}

      {showCreateUser && (
        <CreateUserModal
          sessionId={sessionId}
          onClose={() => setShowCreateUser(false)}
        />
      )}

      {showCheckBalance && (
        <CheckBalanceModal
          sessionId={sessionId}
          onClose={() => setShowCheckBalance(false)}
        />
      )}

      {showLedger && (
        <LedgerModal
          sessionId={sessionId}
          onClose={() => setShowLedger(false)}
        />
      )}
    </main>
  );
}
