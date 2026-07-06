import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { Camera, Video } from "lucide-react";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Monitoring — SORTIFY AI" },
      { name: "description", content: "Live camera feed and detection telemetry for the segregation unit." },
    ],
  }),
  component: LivePage,
});

const sensors = [
  { name: "ESP32", ok: true },
  { name: "Camera", ok: true },
  { name: "Metal Sensor", ok: true },
  { name: "Moisture Sensor", ok: true },
  { name: "IR", ok: true },
  { name: "Servo", ok: true },
  { name: "Cloud", ok: true },
];

export default function LivePage() {
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
              <Camera className="h-3 w-3" /> ESP32-CAM · 640×480
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between text-[11px] text-white/60">
              <div className="rounded-md bg-black/60 px-2 py-1">FPS <span className="text-white ml-1">24</span></div>
              <div className="rounded-md bg-black/60 px-2 py-1">Detection <span className="text-white ml-1">42 ms</span></div>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Current Detection">
            <div className="text-xs text-white/50">Object</div>
            <div className="text-2xl font-semibold mt-1">Metal Can</div>
            <div className="mt-4 space-y-3">
              <Row label="Confidence" value="98%" accent />
              <Row label="Predicted Bin" value="Metal" />
              <Row label="Weight" value="0.34 kg" />
              <Row label="Moisture" value="12%" />
              <Row label="Metal" value="Detected" />
              <Row label="Distance" value="8 cm" />
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
