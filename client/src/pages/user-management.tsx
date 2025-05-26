import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UserManagement() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="User Management" 
        subtitle="Manage users, roles, and access permissions" 
      />
      
      <main className="flex-1 overflow-auto p-6">
        <Card className="border border-gray-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-dark">User Administration</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              User management interface coming soon...
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
