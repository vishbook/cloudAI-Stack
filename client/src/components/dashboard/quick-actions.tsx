import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Stethoscope, Bell, Zap, ChevronRight } from "lucide-react";
import { CreateVMModal } from "@/components/modals/create-vm-modal";
import type { QuickAction } from "@/types";

export function QuickActions() {
  const [isCreateVMOpen, setIsCreateVMOpen] = useState(false);

  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ["/api/alerts/unread"],
    queryFn: api.getUnreadAlerts,
    refetchInterval: 30000,
  });

  const quickActions: QuickAction[] = [
    {
      icon: "plus",
      title: "Create Virtual Machine",
      color: "primary",
      action: () => setIsCreateVMOpen(true),
    },
    {
      icon: "stethoscope",
      title: "Run System Diagnostics",
      color: "secondary",
      action: () => console.log("Run diagnostics"),
    },
    {
      icon: "bell",
      title: "View All Alerts",
      description: `${unreadAlerts.length} active alerts`,
      color: "accent",
      action: () => console.log("View alerts"),
    },
    {
      icon: "zap",
      title: "Auto-Optimize Resources",
      color: "success",
      action: () => console.log("Auto-optimize"),
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "plus":
        return Plus;
      case "stethoscope":
        return Stethoscope;
      case "bell":
        return Bell;
      case "zap":
        return Zap;
      default:
        return Plus;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return {
          iconBg: "bg-primary/10 group-hover:bg-primary/20",
          iconColor: "text-primary",
          hoverBorder: "hover:border-primary",
          hoverBg: "hover:bg-primary/5",
          chevron: "group-hover:text-primary",
        };
      case "secondary":
        return {
          iconBg: "bg-secondary/10 group-hover:bg-secondary/20",
          iconColor: "text-secondary",
          hoverBorder: "hover:border-secondary",
          hoverBg: "hover:bg-secondary/5",
          chevron: "group-hover:text-secondary",
        };
      case "accent":
        return {
          iconBg: "bg-accent/10 group-hover:bg-accent/20",
          iconColor: "text-accent",
          hoverBorder: "hover:border-accent",
          hoverBg: "hover:bg-accent/5",
          chevron: "group-hover:text-accent",
        };
      case "success":
        return {
          iconBg: "bg-success/10 group-hover:bg-success/20",
          iconColor: "text-success",
          hoverBorder: "hover:border-success",
          hoverBg: "hover:bg-success/5",
          chevron: "group-hover:text-success",
        };
      default:
        return {
          iconBg: "bg-gray-100 group-hover:bg-gray-200",
          iconColor: "text-gray-600",
          hoverBorder: "hover:border-gray-300",
          hoverBg: "hover:bg-gray-50",
          chevron: "group-hover:text-gray-600",
        };
    }
  };

  return (
    <>
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <h2 className="text-lg font-semibold text-dark">Quick Actions</h2>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {quickActions.map((action, index) => {
            const Icon = getIcon(action.icon);
            const colors = getColorClasses(action.color);

            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-between p-4 h-auto border border-gray-200 ${colors.hoverBorder} ${colors.hoverBg} transition-all group`}
                onClick={action.action}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${colors.iconBg} rounded-lg flex items-center justify-center transition-colors`}>
                    <Icon className={colors.iconColor} />
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-dark block">{action.title}</span>
                    {action.description && (
                      <span className="text-xs text-light">{action.description}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className={`text-light ${colors.chevron} transition-colors`} />
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <CreateVMModal 
        isOpen={isCreateVMOpen} 
        onClose={() => setIsCreateVMOpen(false)} 
      />
    </>
  );
}
