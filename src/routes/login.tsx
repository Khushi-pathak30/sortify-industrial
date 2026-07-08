import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Recycle, Cpu, Cloud, Zap, Server } from "lucide-react";
import { api, setToken } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SORTIFY AI" },
      { name: "description", content: "Sign in to the SORTIFY AI Smart Waste Segregation Monitoring System." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("admin@sortify.com");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState("Administrator");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ success: boolean; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });
      if (res.success && res.token) {
        setToken(res.token);
        router.navigate({ to: "/" });
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B1120] text-white flex flex-col md:flex-row">
      {/* Left */}
      <div className="relative flex-1 flex flex-col justify-between p-10 md:p-16 overflow-hidden bg-gradient-to-br from-[#0B1120] via-[#0e1a34] to-[#0B1120]">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          background: "radial-gradient(600px 400px at 20% 30%, #3B82F6 0%, transparent 60%), radial-gradient(500px 400px at 80% 80%, #00E5FF 0%, transparent 60%)",
        }} />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#00E5FF]">
            <Recycle className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold tracking-wide">SORTIFY AI</div>
            <div className="text-[11px] text-white/50">Smart Waste Segregation</div>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Smart Waste Segregation Monitoring System
          </h1>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            Monitor and manage industrial waste segregation devices in real time — with edge AI detection, live telemetry and cloud connectivity.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { icon: <Cpu className="h-4 w-4" />, label: "Edge AI" },
              { icon: <Cloud className="h-4 w-4" />, label: "AWS Cloud" },
              { icon: <Zap className="h-4 w-4" />, label: "Real-time" },
              { icon: <Server className="h-4 w-4" />, label: "ESP32" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white/70">
                <span className="text-[#00E5FF]">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] text-white/40">v1.0 · Powered by ESP32 · AWS · Edge Impulse · Flask</div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-white/50 mt-1">Access your control dashboard</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}
            <Field label="Email">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com" 
                className={inputCls} 
                required
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input 
                  type={show ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className={inputCls + " pr-10"} 
                  required
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <Field label="Role">
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}
              >
                <option className="bg-[#0B1120]">Administrator</option>
                <option className="bg-[#0B1120]">Supervisor</option>
                <option className="bg-[#0B1120]">Operator</option>
                <option className="bg-[#0B1120]">Maintenance</option>
              </select>
            </Field>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 accent-[#3B82F6]" />
                Remember me
              </label>
              <a href="#" className="text-[#00E5FF] hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#00E5FF] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center text-[11px] text-white/40">v1.0 · SORTIFY AI</div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#3B82F6]/60 focus:bg-white/[0.07] transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
