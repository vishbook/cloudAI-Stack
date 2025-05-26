import { Header } from "@/components/layout/header";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { VMTable } from "@/components/dashboard/vm-table";

export default function Dashboard() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Infrastructure Dashboard" 
        subtitle="Monitor and manage your private cloud infrastructure" 
      />
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIRecommendations />
          </div>
          <QuickActions />
        </div>
        
        <ResourceCharts />
        
        <VMTable />
      </main>
    </div>
  );
}
