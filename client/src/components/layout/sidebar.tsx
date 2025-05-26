import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Cloud, 
  LayoutDashboard, 
  Server, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Plus, 
  Settings,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Infrastructure", href: "/infrastructure", icon: Server },
  { name: "Live Infrastructure", href: "/live-infrastructure", icon: Activity },
  { name: "AI Monitoring", href: "/ai-monitoring", icon: Brain },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "User Management", href: "/users", icon: Users },
];

const quickActions = [
  { name: "Create VM", href: "#", icon: Plus },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Cloud className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark">CloudAI Stack</h1>
            <p className="text-sm text-light">Private Cloud Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sm font-medium",
                    isActive 
                      ? "bg-primary text-white hover:bg-primary/90" 
                      : "text-light hover:text-dark hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-gray-200 mt-6">
          <h3 className="px-4 text-xs font-semibold text-light uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium text-light hover:text-dark hover:bg-gray-100"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-white text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark truncate">Admin User</p>
            <p className="text-xs text-light truncate">System Administrator</p>
          </div>
          <Button variant="ghost" size="sm" className="text-light hover:text-dark">
            <LogOut className="text-sm" />
          </Button>
        </div>
      </div>
    </div>
  );
}
