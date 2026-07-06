import { useEffect, useState } from "react";
import { Cloud, Cpu } from "lucide-react";

export function Topbar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = now ? now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "";
  const time = now ? now.toLocaleTimeString() : "";

  return (
    <header className="flex items-center h-20 px-8 border-b border-white/5 bg-[#0B1120]/60 backdrop-blur">
      <div>
        <div className="text-sm text-white/50" suppressHydrationWarning>{date}</div>
        <div className="text-lg font-semibold text-white tabular-nums tracking-wider" suppressHydrationWarning>{time}</div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <StatusPill icon={<Cpu className="h-3.5 w-3.5" />} label="ESP32" ok />
        <StatusPill icon={<Cloud className="h-3.5 w-3.5" />} label="AWS Cloud" ok />

        <div className="ml-2 flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right leading-tight">
            <div className="text-sm text-white">Admin</div>
            <div className="text-[11px] text-white/50 flex items-center gap-1.5 justify-end">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Online
            </div>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#00E5FF] flex items-center justify-center text-xs font-semibold text-white">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}

function StatusPill({ icon, label, ok }: { icon: React.ReactNode; label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
      <span className={ok ? "text-[#22C55E]" : "text-[#EF4444]"}>{icon}</span>
      <span>{label}</span>
      <span className={"h-1.5 w-1.5 rounded-full " + (ok ? "bg-[#22C55E] shadow-[0_0_8px_#22C55E]" : "bg-[#EF4444]")} />
    </div>
  );
}
