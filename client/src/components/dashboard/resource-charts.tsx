import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { ChartDataPoint } from "@/types";

export function ResourceCharts() {
  const { data: resourceData = [], isLoading: isResourceLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/charts/resource-usage"],
    queryFn: api.getResourceUsageData,
    refetchInterval: 60000,
  });

  const { data: healthData = [], isLoading: isHealthLoading } = useQuery<ChartDataPoint[]>({
    queryKey: ["/api/charts/health"],
    queryFn: api.getHealthData,
    refetchInterval: 30000,
  });

  const HEALTH_COLORS = {
    Healthy: "#4CAF50",
    Warning: "#FF9800", 
    Critical: "#F44336"
  };

  if (isResourceLoading || isHealthLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border border-gray-200">
            <CardHeader className="border-b border-gray-200">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="w-full h-64" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Resource Usage Chart */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark">Resource Usage Trends</h2>
            <Select defaultValue="7days">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={resourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#78909C" 
                fontSize={12}
              />
              <YAxis 
                stroke="#78909C" 
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: any) => [`${value}%`, ""]}
              />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#1976D2" 
                strokeWidth={2}
                dot={{ fill: "#1976D2", strokeWidth: 2, r: 4 }}
                name="CPU Usage"
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="#FF9800" 
                strokeWidth={2}
                dot={{ fill: "#FF9800", strokeWidth: 2, r: 4 }}
                name="Memory Usage"
              />
              <Line 
                type="monotone" 
                dataKey="storage" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ fill: "#4CAF50", strokeWidth: 2, r: 4 }}
                name="Storage Usage"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Infrastructure Health */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h2 className="text-lg font-semibold text-dark">Infrastructure Health</h2>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={256}>
            <PieChart>
              <Pie
                data={healthData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {healthData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={HEALTH_COLORS[entry.name as keyof typeof HEALTH_COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: any) => [`${value}%`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            {healthData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: HEALTH_COLORS[entry.name as keyof typeof HEALTH_COLORS] }}
                />
                <span className="text-sm text-dark font-medium">{entry.name}</span>
                <span className="text-sm text-light">({entry.value}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
