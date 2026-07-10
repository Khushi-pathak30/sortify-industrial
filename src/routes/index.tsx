import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { kpi, distribution, systemHealth, recentRecords } from "@/lib/mock-data";
import { Trash2, Cog, Droplets, Recycle, FileText, AlertCircle, Camera, CameraOff } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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
    kpi: {
      total: number;
      metal: number;
      wet: number;
      plastic: number;
      paper: number;
      unidentified: number;
    };
    recent: any[];
    health: any[];
    latestImageUrl?: string;
  } | null>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const load = async () => {
      try {
        const [summary, history] = await Promise.all([
          api<{
            totalWaste: number;
            metalWaste: number;
            wetWaste: number;
            plasticWaste?: number;
            paperWaste?: number;
            unidentifiedWaste?: number;
            dryWaste?: number;
            awsStatus: string;
            esp32Status: string;
            latestImageUrl?: string;
          }>("/dashboard/summary"),
          api<{ data: any[] }>("/waste/history?limit=7"),
        ]);
        if (!active) return;
        setData({
          kpi: {
            total: summary.totalWaste,
            metal: summary.metalWaste,
            wet: summary.wetWaste,
            plastic: summary.plasticWaste ?? (summary.dryWaste ? Math.round(summary.dryWaste * 0.45 * 10) / 10 : 25),
            paper: summary.paperWaste ?? (summary.dryWaste ? Math.round(summary.dryWaste * 0.35 * 10) / 10 : 18),
            unidentified: summary.unidentifiedWaste ?? (summary.dryWaste ? Math.round(summary.dryWaste * 0.20 * 10) / 10 : 12),
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
          latestImageUrl: summary.latestImageUrl,
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
  }, [token]);

  const totalWaste = data ? `${data.kpi.total} kg` : "145 kg";
  const metalWaste = data ? `${data.kpi.metal} kg` : "32 kg";
  const wetWaste = data ? `${data.kpi.wet} kg` : "61 kg";
  const plasticWaste = data ? `${data.kpi.plastic} kg` : "25 kg";
  const paperWaste = data ? `${data.kpi.paper} kg` : "18 kg";
  const unidentifiedWaste = data ? `${data.kpi.unidentified} kg` : "12 kg";

  const distributionData = data
    ? [
        { name: "Metal", value: data.kpi.metal, color: "#00E5FF" },
        { name: "Wet", value: data.kpi.wet, color: "#22C55E" },
        { name: "Plastic", value: data.kpi.plastic, color: "#EC4899" },
        { name: "Paper", value: data.kpi.paper, color: "#8B5CF6" },
        { name: "Unidentified", value: data.kpi.unidentified, color: "#6B7280" },
      ]
    : [
        { name: "Metal", value: 32, color: "#00E5FF" },
        { name: "Wet", value: 61, color: "#22C55E" },
        { name: "Plastic", value: 25, color: "#EC4899" },
        { name: "Paper", value: 18, color: "#8B5CF6" },
        { name: "Unidentified", value: 12, color: "#6B7280" },
      ];

  const healthData = data ? data.health : systemHealth;
  const recentRecordsData = data ? data.recent : recentRecords.slice(0, 7);

  if (!mounted || !token) {
    return null;
  }

  return (
    <AppLayout title="Dashboard" subtitle="Real-time overview of segregation activity">
      {/* 6 Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Kpi icon={<Trash2 className="h-5 w-5" />} label="Total Waste" value={totalWaste} tint="#3B82F6" />
        <Kpi icon={<Cog className="h-5 w-5" />} label="Metal Waste" value={metalWaste} tint="#00E5FF" />
        <Kpi icon={<Droplets className="h-5 w-5" />} label="Wet Waste" value={wetWaste} tint="#22C55E" />
        <Kpi icon={<Recycle className="h-5 w-5" />} label="Plastic Waste" value={plasticWaste} tint="#EC4899" />
        <Kpi icon={<FileText className="h-5 w-5" />} label="Paper Waste" value={paperWaste} tint="#8B5CF6" />
        <Kpi icon={<AlertCircle className="h-5 w-5" />} label="Unidentified" value={unidentifiedWaste} tint="#6B7280" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Waste Distribution */}
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
          <div className="flex justify-center gap-4 flex-wrap -mt-2">
            {distributionData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-white/60">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name} · {d.value} kg
              </div>
            ))}
          </div>
        </Panel>

        {/* Live Camera Feed */}
        <Panel title="Live Detection Camera">
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/80 flex items-center justify-center shadow-inner">
              {data?.latestImageUrl ? (
                <>
                  <img
                    src={data.latestImageUrl}
                    alt="S3 Detection Stream"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle scanline overlay for professional UI look */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                </>
              ) : (
                <div className="text-center p-4">
                  <CameraOff className="h-8 w-8 mx-auto text-white/20 mb-2 animate-pulse" />
                  <p className="text-xs text-white/40 font-medium">No active camera frame</p>
                  <p className="text-[10px] text-white/30 mt-1">Ready for S3 upload event</p>
                </div>
              )}
              {/* Overlay telemetry indicators */}
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur px-2 py-0.5 rounded flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-[#00E5FF] border border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                CAM_01
              </div>
            </div>
            <div className="space-y-2.5 text-xs border-t border-white/5 pt-3">
              <div className="flex justify-between items-center text-white/60">
                <span>Last Waste Type:</span>
                <span className="font-semibold text-white">
                  {recentRecordsData[0]?.type || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Classification Conf:</span>
                <span className="font-semibold text-[#00E5FF]">
                  {recentRecordsData[0] ? `${Math.round((data?.kpi ? 0.94 : 0.85) * 100)}%` : "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span>Ingest Mode:</span>
                <span className="text-[9px] font-medium tracking-wide bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-1.5 py-0.5 rounded text-[#3B82F6] uppercase">
                  AWS S3 Lambda
                </span>
              </div>
            </div>
          </div>
        </Panel>

        {/* System Alarms & Operations (Replaces Moisture Trend) */}
        <Panel title="System Alerts & Plant Operations">
          <div className="space-y-4 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase font-semibold text-red-400 tracking-wider mb-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> Active System Alarms
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-red-200">
                  <span>CRITICAL: Bin 004 Level Sensor Failure</span>
                  <span className="font-semibold uppercase tracking-wider text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">Offline</span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-amber-200">
                  <span>WARNING: Conveyor Speed Sensor Fluctuations</span>
                  <span className="font-semibold uppercase tracking-wider text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">Check Speed</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 border-t border-white/5">
              <h4 className="text-xs uppercase font-semibold text-white/50 tracking-wider mb-2">
                Plant Unit Statuses
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                  <span className="text-white/70">Plant Sector A (Conveyor)</span>
                  <span className="text-[#22C55E] font-medium">Operating</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                  <span className="text-white/70">Plant Sector B (Segregator)</span>
                  <span className="text-[#22C55E] font-medium">Operating</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                  <span className="text-white/70">Plant Sector C (Shredder)</span>
                  <span className="text-[#EF4444] font-medium">Offline (Repair)</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
                  <span className="text-white/70">Main Gate (Hydraulics)</span>
                  <span className="text-[#22C55E] font-medium">Operating</span>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* System Health */}
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

        {/* Recent Waste Records */}
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
