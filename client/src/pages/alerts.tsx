import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Info, XCircle, CheckCircle, Clock } from "lucide-react";
import type { Alert } from "@shared/schema";

export default function Alerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    queryFn: api.getAlerts,
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => api.markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unread"] });
      toast({
        title: "Alert Marked as Read",
        description: "The alert has been marked as read.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark alert as read.",
        variant: "destructive",
      });
    },
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return XCircle;
      case "warning":
        return AlertTriangle;
      case "info":
        return Info;
      default:
        return Info;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getAlertBg = (type: string, isRead: boolean) => {
    const opacity = isRead ? "opacity-60" : "";
    switch (type) {
      case "error":
        return `bg-red-50 border-red-200 ${opacity}`;
      case "warning":
        return `bg-amber-50 border-amber-200 ${opacity}`;
      case "info":
        return `bg-blue-50 border-blue-200 ${opacity}`;
      default:
        return `bg-gray-50 border-gray-200 ${opacity}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Alert Management" 
          subtitle="Monitor and manage system alerts and notifications" 
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Card className="border border-gray-200">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border border-gray-200 rounded-lg">
                  <Skeleton className="h-5 w-64 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Alert Management" 
        subtitle="Monitor and manage system alerts and notifications" 
      />
      
      <main className="flex-1 overflow-auto p-6">
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-dark">System Alerts</h2>
              <Badge variant="secondary">
                {alerts.filter(alert => !alert.isRead).length} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No alerts found</p>
                <p className="text-sm text-gray-400">Your system is running smoothly</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  const alertBg = getAlertBg(alert.type, alert.isRead);
                  
                  return (
                    <div
                      key={alert.id}
                      className={`p-6 border-l-4 ${alertBg} ${
                        alert.type === "error" ? "border-l-red-500" :
                        alert.type === "warning" ? "border-l-amber-500" :
                        "border-l-blue-500"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            alert.type === "error" ? "bg-red-100" :
                            alert.type === "warning" ? "bg-amber-100" :
                            "bg-blue-100"
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              alert.type === "error" ? "text-red-600" :
                              alert.type === "warning" ? "text-amber-600" :
                              "text-blue-600"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`font-medium ${alert.isRead ? "text-gray-600" : "text-dark"}`}>
                                {alert.title}
                              </h3>
                              <Badge variant={getAlertColor(alert.severity) as any}>
                                {alert.severity}
                              </Badge>
                              {!alert.isRead && (
                                <Badge variant="default" className="bg-primary text-white">
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm ${alert.isRead ? "text-gray-500" : "text-light"} mb-3`}>
                              {alert.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(alert.createdAt!).toLocaleString()}</span>
                              </div>
                              {alert.resourceType && (
                                <span>Resource: {alert.resourceType}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markReadMutation.mutate(alert.id)}
                              disabled={markReadMutation.isPending}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
