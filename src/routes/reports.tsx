import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { reports } from "@/lib/mock-data";
import { Download, FileDown } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — SORTIFY AI" },
      { name: "description", content: "Daily waste reports with export options." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppLayout title="Reports" subtitle="Historical daily summaries">
      <Panel
        title="Daily Reports"
        action={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
              <FileDown className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-3 py-1.5 text-xs text-white hover:bg-[#3B82F6]/90 transition">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Metal</th>
                <th className="pb-3 font-medium">Wet</th>
                <th className="pb-3 font-medium">Dry</th>
                <th className="pb-3 font-medium">Accuracy</th>
                <th className="pb-3 font-medium text-right">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {reports.map((r) => (
                <tr key={r.date} className="text-white/80">
                  <td className="py-3 tabular-nums text-white/60">{r.date}</td>
                  <td className="py-3 tabular-nums">{r.total} kg</td>
                  <td className="py-3 tabular-nums">{r.metal} kg</td>
                  <td className="py-3 tabular-nums">{r.wet} kg</td>
                  <td className="py-3 tabular-nums">{r.dry} kg</td>
                  <td className="py-3 tabular-nums text-[#22C55E]">{r.accuracy}</td>
                  <td className="py-3 text-right">
                    <button className="text-white/50 hover:text-[#00E5FF] transition">
                      <Download className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppLayout>
  );
}
