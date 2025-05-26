import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: unreadAlerts = [] } = useQuery({
    queryKey: ["/api/alerts/unread"],
    queryFn: api.getUnreadAlerts,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">{title}</h1>
          <p className="text-light text-sm mt-1">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* AI Status Indicator */}
          <div className="flex items-center space-x-2 bg-success/10 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-success">AI Analytics Active</span>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-light hover:text-dark">
            <Bell className="text-lg" />
            {unreadAlerts.length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadAlerts.length}
              </Badge>
            )}
          </Button>
          
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
