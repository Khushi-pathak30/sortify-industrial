import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { kpi, distribution, moistureTrend, systemHealth, recentRecords } from "@/lib/mock-data";
import { Trash2, Cog, Droplets, Wind } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SORTIFY AI" },
      { name: "description", content: "Industrial IoT monitoring dashboard for smart waste segregation." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.navigate({ to: "/login" });
    }
  }, [token, router]);

  const [data, setData] = useState<{
    kpi: { total: number; metal: number; wet: number; dry: number };
    recent: any[];
    health: any[];
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const load = async () => {
      try {
        const [summary, history] = await Promise.all([
          api<{ totalWaste: number; metalWaste: number; wetWaste: number; dryWaste: number; awsStatus: string; esp32Status: string }>(
            "/dashboard/summary"
          ),
          api<{ data: any[] }>("/waste/history?limit=7"),
        ]);
        if (!active) return;
        setData({
          kpi: {
            total: summary.totalWaste,
            metal: summary.metalWaste,
            wet: summary.wetWaste,
            dry: summary.dryWaste,
          },
          recent: history.data.map((r) => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour12: false }),
            metal: r.waste === "Metal" ? "Detected" : "—",
            moisture: r.waste === "Organic" ? "45%" : "15%",
            ir: r.waste === "Plastic" ? "Detected" : "—",
            type: r.waste,
            status: "Sorted",
          })),
          health: [
            { name: "ESP32", online: summary.esp32Status === "Online" },
            { name: "ESP32 Camera", online: summary.esp32Status === "Online" },
            { name: "Metal Sensor", online: true },
            { name: "Moisture Sensor", online: true },
            { name: "IR Sensor", online: true },
            { name: "Servo", online: true },
            { name: "AWS Cloud", online: summary.awsStatus === "Connected" },
          ],
        });
      } catch (err) {
        console.error("Dashboard: failed to fetch metrics:", err);
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const totalWaste = data ? `${data.kpi.total} kg` : `${kpi.total} kg`;
  const metalWaste = data ? `${data.kpi.metal} kg` : `${kpi.metal} kg`;
  const wetWaste = data ? `${data.kpi.wet} kg` : `${kpi.wet} kg`;
  const dryWaste = data ? `${data.kpi.dry} kg` : `${kpi.dry} kg`;

  const distributionData = data
    ? [
        { name: "Metal", value: data.kpi.metal, color: "#00E5FF" },
        { name: "Wet", value: data.kpi.wet, color: "#22C55E" },
        { name: "Dry", value: data.kpi.dry, color: "#F59E0B" },
      ]
    : distribution;

  const healthData = data ? data.health : systemHealth;
  const recentRecordsData = data ? data.recent : recentRecords.slice(0, 7);

  if (!mounted || !token) {
    return null;
  }

  return (
    <AppLayout title="Dashboard" subtitle="Real-time overview of segregation activity">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Kpi icon={<Trash2 className="h-5 w-5" />} label="Total Waste" value={totalWaste} tint="#3B82F6" />
        <Kpi icon={<Cog className="h-5 w-5" />} label="Metal Waste" value={metalWaste} tint="#00E5FF" />
        <Kpi icon={<Droplets className="h-5 w-5" />} label="Wet Waste" value={wetWaste} tint="#22C55E" />
        <Kpi icon={<Wind className="h-5 w-5" />} label="Dry Waste" value={dryWaste} tint="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Panel title="Waste Distribution">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} stroke="none">
                  {distributionData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 -mt-2">
            {distributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-white/60">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name} · {d.value} kg
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Moisture Trend">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={moistureTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="t" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="moisture" stroke="#00E5FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Panel title="System Health">
          <ul className="divide-y divide-white/5">
            {healthData.map((s) => (
              <li key={s.name} className="flex items-center justify-between py-3">
                <span className="text-sm text-white/80">{s.name}</span>
                <span className={"flex items-center gap-2 text-xs " + (s.online ? "text-[#22C55E]" : "text-[#EF4444]")}>
                  <span className={"h-1.5 w-1.5 rounded-full " + (s.online ? "bg-[#22C55E]" : "bg-[#EF4444]")} />
                  {s.online ? "Online" : "Offline"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent Waste Records">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Metal</th>
                  <th className="pb-3 font-medium">Moist.</th>
                  <th className="pb-3 font-medium">IR</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentRecordsData.slice(0, 7).map((r, i) => (
                  <tr key={i} className="text-white/80">
                    <td className="py-2.5 tabular-nums text-white/60">{r.time}</td>
                    <td className="py-2.5">{r.metal}</td>
                    <td className="py-2.5 tabular-nums">{r.moisture}</td>
                    <td className="py-2.5">{r.ir}</td>
                    <td className="py-2.5">{r.type}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center rounded-full bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 text-xs">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppLayout>
  );
}

function Kpi({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: `${tint}15`, color: tint, boxShadow: `inset 0 0 0 1px ${tint}30` }}
        >
          {icon}
        </div>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
      </div>
      <div className="mt-5 text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-white/50">{label}</div>
    </div>
  );
}
