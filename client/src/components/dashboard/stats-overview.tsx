import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Server, HardDrive, Network, Heart, TrendingUp, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types";

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: api.getDashboardStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Servers",
      value: stats.totalServers.toString(),
      change: `${stats.serverGrowth} from last month`,
      icon: Server,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      changeIcon: TrendingUp,
      changeColor: "text-success"
    },
    {
      title: "Storage Used",
      value: stats.storageUsed,
      change: `${stats.storagePercent}% capacity`,
      icon: HardDrive,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      changeIcon: AlertTriangle,
      changeColor: stats.storagePercent > 75 ? "text-warning" : "text-success"
    },
    {
      title: "Network Traffic",
      value: stats.networkTraffic,
      change: `${stats.networkGrowth} increase`,
      icon: Network,
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      changeIcon: TrendingUp,
      changeColor: "text-success"
    },
    {
      title: "Health Score",
      value: stats.healthScore,
      change: "Excellent condition",
      icon: Heart,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      changeIcon: TrendingUp,
      changeColor: "text-success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const ChangeIcon = stat.changeIcon;
        
        return (
          <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-light">{stat.title}</p>
                  <p className="text-3xl font-bold text-dark mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${stat.changeColor}`}>
                    <ChangeIcon className="w-4 h-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${stat.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
