import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SORTIFY AI" },
      { name: "description", content: "Device, network, cloud, and threshold configuration." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppLayout title="Settings" subtitle="Device & system configuration">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Device Settings">
          <Field label="Device Name" value="SORTIFY-01" />
          <Field label="Firmware" value="v1.4.2" />
        </Panel>

        <Panel title="WiFi Configuration">
          <Field label="SSID" value="Sortify-Net" />
          <Field label="Password" value="••••••••" />
        </Panel>

        <Panel title="AWS Configuration">
          <Field label="Region" value="ap-south-1" />
          <Field label="IoT Endpoint" value="a1b2c3.iot.aws" />
        </Panel>

        <Panel title="Camera Settings">
          <Field label="Resolution" value="640×480" />
          <Field label="FPS" value="24" />
        </Panel>

        <Panel title="Threshold Settings">
          <Field label="Moisture Threshold" value="40%" />
          <Field label="Metal Threshold" value="Detected" />
        </Panel>

        <Panel title="Appearance">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/70">Dark Theme</span>
            <span className="inline-flex h-5 w-9 items-center rounded-full bg-[#3B82F6]/40 p-0.5">
              <span className="h-4 w-4 rounded-full bg-[#00E5FF] translate-x-4 transition-transform" />
            </span>
          </div>
        </Panel>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10 transition">Reset</button>
        <button className="rounded-lg bg-gradient-to-r from-[#3B82F6] to-[#00E5FF] px-5 py-2 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 hover:opacity-90 transition">Save Changes</button>
      </div>
    </AppLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2.5">
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">{label}</div>
      <input
        defaultValue={value}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#3B82F6]/60 transition"
      />
    </div>
  );
}
