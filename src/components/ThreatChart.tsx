import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ThreatChartProps {
  threats: Array<{ severity: string; timestamp: number }>;
}

export const ThreatChart = ({ threats }: ThreatChartProps) => {
  const chartData = useMemo(() => {
    if (threats.length === 0) return [];

    const timeGroups = threats.reduce((acc, threat) => {
      const time = new Date(threat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!acc[time]) {
        acc[time] = { time, critical: 0, warning: 0, info: 0 };
      }
      if (threat.severity === "critical") acc[time].critical++;
      else if (threat.severity === "warning") acc[time].warning++;
      else acc[time].info++;
      return acc;
    }, {} as Record<string, { time: string; critical: number; warning: number; info: number }>);

    return Object.values(timeGroups).slice(-10);
  }, [threats]);

  return (
    <div style={{ width: '100%', height: 300, contain: 'layout style paint', contentVisibility: 'auto' }}>
      <ResponsiveContainer width="100%" height={300} debounce={50}>
        <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="time" 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            color: 'hsl(var(--foreground))'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="critical" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--destructive))' }}
        />
        <Line 
          type="monotone" 
          dataKey="warning" 
          stroke="hsl(var(--warning))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--warning))' }}
        />
        <Line 
          type="monotone" 
          dataKey="info" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
