import { Header } from "@/components/layout/header";
import { VMTable } from "@/components/dashboard/vm-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Infrastructure() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Infrastructure Management" 
        subtitle="Manage your virtual machines and compute resources" 
      />
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <VMTable />
        
        <Card className="border border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-dark">Resource Allocation</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Resource allocation management coming soon...
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
