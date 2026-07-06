export const kpi = {
  total: 145,
  metal: 32,
  wet: 61,
  dry: 52,
};

export const distribution = [
  { name: "Metal", value: 32, color: "#00E5FF" },
  { name: "Wet", value: 61, color: "#22C55E" },
  { name: "Dry", value: 52, color: "#F59E0B" },
];

export const moistureTrend = Array.from({ length: 24 }, (_, i) => ({
  t: `${String(i).padStart(2, "0")}:00`,
  moisture: Math.round(25 + Math.sin(i / 3) * 8 + Math.random() * 6),
}));

export const dailyCollection = [
  "Mon","Tue","Wed","Thu","Fri","Sat","Sun",
].map((d) => ({
  day: d,
  metal: Math.round(20 + Math.random() * 30),
  wet: Math.round(30 + Math.random() * 40),
  dry: Math.round(25 + Math.random() * 35),
}));

export const weeklyTrend = Array.from({ length: 12 }, (_, i) => ({
  w: `W${i + 1}`,
  total: Math.round(100 + Math.random() * 80),
}));

export const systemHealth = [
  { name: "ESP32", online: true },
  { name: "ESP32 Camera", online: true },
  { name: "Metal Sensor", online: true },
  { name: "Moisture Sensor", online: true },
  { name: "IR Sensor", online: true },
  { name: "Servo", online: true },
  { name: "AWS Cloud", online: true },
];

const wasteTypes = ["Metal", "Wet", "Dry"] as const;
export const recentRecords = Array.from({ length: 12 }, (_, i) => {
  const type = wasteTypes[i % 3];
  const h = String(10 + Math.floor(i / 6)).padStart(2, "0");
  const m = String((i * 7) % 60).padStart(2, "0");
  const s = String((i * 13) % 60).padStart(2, "0");
  return {
    time: `${h}:${m}:${s}`,
    metal: type === "Metal" ? "Detected" : "—",
    moisture: `${20 + ((i * 5) % 60)}%`,
    ir: "Detected",
    proximity: "Detected",
    type,
    status: "Sorted",
  };
});

export const reports = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const total = Math.round(100 + Math.random() * 80);
  const metal = Math.round(total * 0.22);
  const wet = Math.round(total * 0.42);
  const dry = total - metal - wet;
  return {
    date: d.toISOString().slice(0, 10),
    total,
    metal,
    wet,
    dry,
    accuracy: (94 + Math.random() * 5).toFixed(1) + "%",
  };
});
