"use client";

import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from "recharts";

interface ProgressRadarChartProps {
  data: {
    technical: number;
    aptitude: number;
    interview: number;
    resume: number;
  };
}

export const ProgressRadarChart = ({ data }: ProgressRadarChartProps) => {
  const chartData = [
    { subject: "Technical", A: data.technical, fullMark: 100 },
    { subject: "Aptitude", A: data.aptitude, fullMark: 100 },
    { subject: "Interview", A: data.interview, fullMark: 100 },
    { subject: "Resume", A: data.resume, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 text-sm">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#ccc", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#666" }} />
          <Radar
            name="Readiness"
            dataKey="A"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.4}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#18181b", borderColor: "#333", borderRadius: "8px" }}
            itemStyle={{ color: "#a855f7" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
