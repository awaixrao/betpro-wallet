import LoginForm from "../components/LoginForm";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B0E14] flex items-center justify-center p-4">
      {/* Ambient grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#4C8EFF]/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        <LoginForm />
      </div>
    </main>
  );
}
