import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { Camera, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — SORTIFY AI" },
      { name: "description", content: "Live camera feed and detection telemetry for the segregation unit." },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.navigate({ to: "/login" });
    }
  }, [token, router]);

  const [telemetry, setTelemetry] = useState<any>(null);
  const [lastEvent, setLastEvent] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const fetchTelemetry = async () => {
      try {
        const data = await api<any>("/sensors/live");
        if (active) setTelemetry(data);
      } catch (err) {
        console.error("LivePage: failed to fetch telemetry:", err);
      }
    };

    const fetchLastEvent = async () => {
      try {
        const res = await api<any>("/waste/history?limit=1");
        if (active && res.data && res.data[0]) {
          setLastEvent(res.data[0]);
        }
      } catch (err) {
        console.error("LivePage: failed to fetch last event:", err);
      }
    };

    fetchTelemetry();
    fetchLastEvent();

    const tId = setInterval(fetchTelemetry, 2500);
    const eId = setInterval(fetchLastEvent, 3000);

    return () => {
      active = false;
      clearInterval(tId);
      clearInterval(eId);
    };
  }, [token]);

  const sensors = [
    { name: "ESP32", ok: !!telemetry },
    { name: "Camera", ok: telemetry?.camera === "Online" },
    { name: "Metal Sensor", ok: !!telemetry },
    { name: "Moisture Sensor", ok: !!telemetry },
    { name: "IR Sensor", ok: !!telemetry },
    { name: "Servo", ok: !!telemetry },
    { name: "AWS Cloud", ok: telemetry?.cloudConnected },
  ];

  if (!mounted || !token) {
    return null;
  }

  return (
    <AppLayout title="Live Monitoring" subtitle="Live camera feed & real-time detection">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel className="lg:col-span-2" title="Camera Feed" action={
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" /> LIVE
          </div>
        }>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black">
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <Video className="h-16 w-16" />
            </div>
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-md bg-black/60 px-2 py-1 text-[11px] text-white/80">
              <Camera className="h-3 w-3" /> {telemetry?.device ?? "ESP32-CAM"} · 1080p
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[11px] text-white/60">
              <div className="rounded-md bg-black/60 px-2 py-1">FPS <span className="text-white ml-1">30</span></div>
              <div className="rounded-md bg-black/60 px-2 py-1">Detection <span className="text-white ml-1">{telemetry?.avgProcessingMs ?? 42} ms</span></div>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Current Detection">
            <div className="text-xs text-white/50">Object</div>
            <div className="text-2xl font-semibold mt-1">{lastEvent ? `${lastEvent.waste} Item` : "Metal Can"}</div>
            <div className="mt-4 space-y-3">
              <Row label="Confidence" value={lastEvent ? `${Math.round(lastEvent.confidence * 100)}%` : "98%"} accent />
              <Row label="Predicted Bin" value={lastEvent ? lastEvent.waste : "Metal"} />
              <Row label="Weight" value={lastEvent ? `${lastEvent.weightKg} kg` : "0.34 kg"} />
              <Row label="Moisture" value={lastEvent ? `${lastEvent.moisture ?? 12}%` : "12%"} />
              <Row label="Metal" value={lastEvent ? (lastEvent.waste === "Metal" ? "Detected" : "—") : "Detected"} />
              <Row label="Distance" value={telemetry ? `${telemetry.distanceCm} cm` : "8 cm"} />
            </div>
          </Panel>

          <Panel title="Sensor Status">
            <div className="grid grid-cols-2 gap-2">
              {sensors.map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="text-white/70">{s.name}</span>
                  <span className={"h-1.5 w-1.5 rounded-full " + (s.ok ? "bg-[#22C55E]" : "bg-[#EF4444]")} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppLayout>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className={accent ? "text-[#00E5FF] font-medium" : "text-white"}>{value}</span>
    </div>
  );
}
