import { Header } from "@/components/layout/header";
import { AIRecommendations } from "@/components/dashboard/ai-recommendations";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AIMonitoring() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="AI Monitoring" 
        subtitle="AI-powered insights and predictive analytics for your infrastructure" 
      />
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <AIRecommendations />
        
        <ResourceCharts />
        
        <Card className="border border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-dark">Predictive Analysis</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Advanced predictive analytics dashboard coming soon...
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
