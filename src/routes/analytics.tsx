import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Panel } from "@/components/app-layout";
import { distribution, dailyCollection, weeklyTrend } from "@/lib/mock-data";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — SORTIFY AI" },
      { name: "description", content: "Distribution, daily collection, and trend analytics." },
    ],
  }),
  component: AnalyticsPage,
});

const tooltip = { background: "#0B1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 };

function AnalyticsPage() {
  return (
    <AppLayout title="Analytics" subtitle="Historical performance & waste type breakdown">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Waste Distribution">
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={2} stroke="none">
                  {distribution.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Daily Collection">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={dailyCollection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltip} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="metal" stackId="a" fill="#00E5FF" radius={[0, 0, 0, 0]} />
                <Bar dataKey="wet" stackId="a" fill="#22C55E" />
                <Bar dataKey="dry" stackId="a" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Weekly Trend">
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="w" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltip} />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Waste Type Comparison">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={dailyCollection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltip} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                <Bar dataKey="metal" fill="#00E5FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="wet" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="dry" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </AppLayout>
  );
}
