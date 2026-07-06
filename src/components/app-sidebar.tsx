import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Radio, BarChart3, FileText, Settings, LogOut, Recycle } from "lucide-react";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Live Monitoring", url: "/live", icon: Radio },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/5 bg-[#0B1120]/80 backdrop-blur">
      <div className="flex items-center gap-3 px-5 h-20 border-b border-white/5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#00E5FF] shadow-lg shadow-[#3B82F6]/20">
          <Recycle className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide text-white">SORTIFY AI</div>
          <div className="text-[11px] text-white/50">Smart Waste Segregation</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const active = pathname === item.url;
          return (
            <Link
              key={item.url}
              to={item.url}
              className={
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors " +
                (active
                  ? "bg-gradient-to-r from-[#3B82F6]/20 to-transparent text-white border border-[#3B82F6]/30 shadow-inner"
                  : "text-white/60 hover:text-white hover:bg-white/5")
              }
            >
              <item.icon className={"h-4 w-4 " + (active ? "text-[#00E5FF]" : "")} />
              <span>{item.title}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00E5FF]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5">
        <Link
          to="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
