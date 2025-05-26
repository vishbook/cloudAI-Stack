import { Header } from "@/components/layout/header";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Analytics & Reporting" 
        subtitle="Detailed analytics and performance reports for your infrastructure" 
      />
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <StatsOverview />
        
        <ResourceCharts />
        
        <Card className="border border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-dark">Custom Reports</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Custom reporting dashboard coming soon...
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
