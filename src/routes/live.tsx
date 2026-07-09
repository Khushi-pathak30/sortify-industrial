import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "System Alerts — SORTIFY AI" },
      { name: "description", content: "Active system alerts and hardware diagnostics log." },
    ],
  }),
  component: AlertsPage,
});

interface Alarm {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  component: string;
  message: string;
  status: "Active" | "Resolved";
  duration?: string;
}

function AlertsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.navigate({ to: "/login" });
    }
  }, [token, router]);

  // Initial dummy alert state
  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: "ALM-401",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString([], { hour12: false }),
      severity: "critical",
      component: "Bin 004 Sensor",
      message: "Ultrasonic level sensor read timeout, bin monitoring suspended",
      status: "Active"
    },
    {
      id: "ALM-308",
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toLocaleTimeString([], { hour12: false }),
      severity: "warning",
      component: "Conveyor A1 Motor",
      message: "Thermal threshold exceeded (78°C). Fan operating at 100% capacity",
      status: "Active"
    },
    {
      id: "ALM-202",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString([], { hour12: false }),
      severity: "info",
      component: "ESP32 Controller",
      message: "System reboot completed. Config fetched from AWS IoT Registry successfully",
      status: "Resolved",
      duration: "45s"
    },
    {
      id: "ALM-198",
      timestamp: new Date(Date.now() - 1000 * 60 * 62).toLocaleTimeString([], { hour12: false }),
      severity: "warning",
      component: "Pneumatic Segregator",
      message: "Actuator response delay (280ms) exceeding 200ms threshold",
      status: "Resolved",
      duration: "12m"
    },
    {
      id: "ALM-154",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString([], { hour12: false }),
      severity: "critical",
      component: "Metal Detector Inductive",
      message: "Calibration failure on primary inductive feedback loop",
      status: "Resolved",
      duration: "48m"
    }
  ]);

  // Fluctuate / generate simulated alert items dynamically in frontend memory
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      // 25% chance to create a new warning
      if (Math.random() < 0.25) {
        const components = ["Optical Camera", "Bin 002 Sensor", "Main Gate Hydraulics", "ESP32 Wi-Fi module", "Emergency Stop Switch"];
        const messages = [
          "Ambient lighting causing object classification confidence drops",
          "Level sensor reading fluctuation (potential dust cover blockage)",
          "Hydraulic fluid pressure drop detected (under 4.2 bar)",
          "Packet drop rate exceeded 5% on primary router connection",
          "Trigger state checked - line interlock circuit warning"
        ];
        const idx = Math.floor(Math.random() * components.length);
        const severities: ("critical" | "warning" | "info")[] = ["warning", "info", "critical"];
        const newAlarm: Alarm = {
          id: `ALM-${Math.floor(randomRange(410, 999))}`,
          timestamp: new Date().toLocaleTimeString([], { hour12: false }),
          severity: severities[Math.floor(Math.random() * 3)],
          component: components[idx],
          message: messages[idx],
          status: "Active"
        };
        setAlarms(prev => [newAlarm, ...prev].slice(0, 15));
      } else {
        // Otherwise try to auto-resolve an active alarm to simulate repairs
        setAlarms(prev => {
          const actives = prev.filter(a => a.status === "Active");
          if (actives.length > 1) { // Leave at least 1 active for visual alerts
            const toResolve = actives[Math.floor(Math.random() * actives.length)];
            return prev.map(a => {
              if (a.id === toResolve.id) {
                return {
                  ...a,
                  status: "Resolved",
                  duration: `${Math.floor(randomRange(1, 15))}m`
                };
              }
              return a;
            });
          }
          return prev;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

  const activeCount = alarms.filter(a => a.status === "Active").length;
  const criticalCount = alarms.filter(a => a.status === "Active" && a.severity === "critical").length;
  const warningCount = alarms.filter(a => a.status === "Active" && a.severity === "warning").length;

  if (!mounted || !token) {
    return null;
  }

  return (
    <AppLayout title="System Alerts & Diagnostics" subtitle="Live active alarms, warnings, and hardware event log.">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Active Alarms" value={activeCount.toString()} tint={activeCount > 0 ? "#EF4444" : "#22C55E"} icon={<AlertTriangle />} />
        <MetricCard label="Critical Failures" value={criticalCount.toString()} tint={criticalCount > 0 ? "#EF4444" : "#6B7280"} icon={<ShieldAlert />} />
        <MetricCard label="Active Warnings" value={warningCount.toString()} tint={warningCount > 0 ? "#F59E0B" : "#6B7280"} icon={<AlertTriangle />} />
        <MetricCard label="Mean Time To Resolve" value="14.8m" tint="#3B82F6" icon={<Clock />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Active Alarms Feed */}
        <div className="lg:col-span-2 space-y-4">
          <Panel title="Active Incident Alarms" action={
            <div className="flex items-center gap-2 text-xs text-white/50">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#00E5FF]" /> Live Diagnostics
            </div>
          }>
            <div className="space-y-3">
              {alarms.filter(a => a.status === "Active").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/40">
                  <CheckCircle2 className="h-12 w-12 text-[#22C55E] mb-2" />
                  <p className="text-sm">All systems nominal. No active alarms.</p>
                </div>
              ) : (
                alarms.filter(a => a.status === "Active").map(a => (
                  <div
                    key={a.id}
                    className={`rounded-xl border p-4 transition-all duration-300 ${
                      a.severity === "critical"
                        ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                        : "border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className={`mt-0.5 rounded-lg p-1.5 ${
                          a.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{a.component}</span>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              a.severity === "critical" ? "bg-red-500/25 text-red-200" : "bg-amber-500/25 text-amber-200"
                            }`}>
                              {a.severity}
                            </span>
                          </div>
                          <p className="text-xs text-white/70 mt-1 leading-relaxed">{a.message}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-white/40">{a.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>

        {/* Hardware Status List */}
        <div>
          <Panel title="Component Health Status">
            <div className="space-y-4">
              <ComponentRow name="Conveyor Infeed Sensor" status="online" info="ESP32-CAM" />
              <ComponentRow name="Secondary Bin Level (Paper)" status="online" info="Ultrasonic" />
              <ComponentRow name="Primary Bin Level (Metal)" status="online" info="Ultrasonic" />
              <ComponentRow name="Tertiary Bin Level (Plastic)" status="online" info="Ultrasonic" />
              <ComponentRow name="Quaternary Bin Level (Organic)" status="offline" info="Ultrasonic Failure" />
              <ComponentRow name="Pneumatic Valve Actuator" status="online" info="Servo-Controlled" />
              <ComponentRow name="Metal Sensor Loop" status="online" info="Inductive Coil" />
              <ComponentRow name="AWS MQTT Connection" status="online" info="IoT Core Link" />
            </div>
          </Panel>
        </div>
      </div>

      {/* Incident History Log */}
      <div className="mt-6">
        <Panel title="Incident History Log (Past 12 Hours)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/5 pb-3">
                  <th className="pb-3 font-medium">Incident ID</th>
                  <th className="pb-3 font-medium">Trigger Time</th>
                  <th className="pb-3 font-medium">Component</th>
                  <th className="pb-3 font-medium">Message</th>
                  <th className="pb-3 font-medium">Severity</th>
                  <th className="pb-3 font-medium">Downtime</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {alarms.map((a, i) => (
                  <tr key={i} className="text-white/80 hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 font-mono text-xs text-[#00E5FF]">{a.id}</td>
                    <td className="py-3 text-white/60 tabular-nums">{a.timestamp}</td>
                    <td className="py-3 font-medium">{a.component}</td>
                    <td className="py-3 text-xs text-white/70 max-w-xs truncate">{a.message}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        a.severity === "critical"
                          ? "bg-red-500/10 text-red-400"
                          : a.severity === "warning"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-blue-500/10 text-blue-400"
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3 tabular-nums text-white/60">{a.status === "Active" ? "Ongoing" : a.duration}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                        a.status === "Active" ? "bg-red-500/10 text-red-400" : "bg-[#22C55E]/10 text-[#22C55E]"
                      }`}>
                        {a.status}
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

function MetricCard({ label, value, tint, icon }: { label: string; value: string; tint: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/50">{label}</span>
        <div className="p-2 rounded-lg text-white" style={{ background: `${tint}15`, color: tint }}>
          {icon}
        </div>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-white tabular-nums" style={{ color: value === "0" ? "#fff" : undefined }}>{value}</div>
    </div>
  );
}

function ComponentRow({ name, status, info }: { name: string; status: "online" | "offline"; info: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0">
      <div>
        <div className="text-xs font-semibold text-white/80">{name}</div>
        <div className="text-[10px] text-white/40">{info}</div>
      </div>
      <span className={`inline-flex items-center gap-1.5 text-xs ${status === "online" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${status === "online" ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
        {status === "online" ? "Online" : "Fault"}
      </span>
    </div>
  );
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
