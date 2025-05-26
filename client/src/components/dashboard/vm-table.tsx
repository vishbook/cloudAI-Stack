import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Server, Eye, Edit, Square, Play, RotateCcw, Plus } from "lucide-react";
import { CreateVMModal } from "@/components/modals/create-vm-modal";
import { useToast } from "@/hooks/use-toast";
import type { VirtualMachine } from "@shared/schema";

export function VMTable() {
  const [isCreateVMOpen, setIsCreateVMOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vms = [], isLoading } = useQuery<VirtualMachine[]>({
    queryKey: ["/api/vms"],
    queryFn: api.getVMs,
    refetchInterval: 30000,
  });

  const updateVMMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.updateVM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      toast({
        title: "VM Updated",
        description: "Virtual machine status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update virtual machine.",
        variant: "destructive",
      });
    },
  });

  const deleteVMMutation = useMutation({
    mutationFn: (id: number) => api.deleteVM(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      toast({
        title: "VM Deleted",
        description: "Virtual machine deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete virtual machine.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
            <div className="w-1.5 h-1.5 bg-success rounded-full mr-1.5" />
            Running
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
            <div className="w-1.5 h-1.5 bg-warning rounded-full mr-1.5" />
            Maintenance
          </Badge>
        );
      case "stopped":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5" />
            Stopped
          </Badge>
        );
      case "error":
        return (
          <Badge variant="secondary" className="bg-error/10 text-error border-error/20">
            <div className="w-1.5 h-1.5 bg-error rounded-full mr-1.5" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getVMIcon = (template: string) => {
    const iconColor = template.includes("Ubuntu") ? "text-primary" : 
                     template.includes("CentOS") ? "text-secondary" : 
                     "text-accent";
    const bgColor = template.includes("Ubuntu") ? "bg-primary/10" : 
                   template.includes("CentOS") ? "bg-secondary/10" : 
                   "bg-accent/10";
    
    return { iconColor, bgColor };
  };

  const handleVMAction = (vm: VirtualMachine, action: string) => {
    let newStatus = vm.status;
    
    switch (action) {
      case "start":
        newStatus = "running";
        break;
      case "stop":
        newStatus = "stopped";
        break;
      case "maintenance":
        newStatus = "maintenance";
        break;
    }
    
    updateVMMutation.mutate({ id: vm.id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {["Name", "Status", "CPU", "Memory", "Storage", "Uptime", "Actions"].map((header) => (
                    <TableHead key={header} className="text-xs font-medium text-light uppercase">
                      <Skeleton className="h-4 w-16" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark">Virtual Machines</h2>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/vms"] })}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateVMOpen(true)}
                className="bg-primary hover:bg-secondary text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create VM
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {vms.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No virtual machines found</p>
              <Button onClick={() => setIsCreateVMOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First VM
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">Name</TableHead>
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">CPU</TableHead>
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">Memory</TableHead>
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">Storage</TableHead>
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">Uptime</TableHead>
                    <TableHead className="text-xs font-medium text-light uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200">
                  {vms.map((vm) => {
                    const { iconColor, bgColor } = getVMIcon(vm.template);
                    
                    return (
                      <TableRow key={vm.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mr-3`}>
                              <Server className={`${iconColor} text-sm`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-dark">{vm.name}</div>
                              <div className="text-sm text-light">{vm.template}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(vm.status)}
                        </TableCell>
                        <TableCell className="text-sm text-dark">
                          {vm.cpuCores} vCPUs ({vm.cpuUsage}%)
                        </TableCell>
                        <TableCell className="text-sm text-dark">
                          {vm.memory}GB ({vm.memoryUsage}%)
                        </TableCell>
                        <TableCell className="text-sm text-dark">{vm.storage}GB</TableCell>
                        <TableCell className="text-sm text-dark">{vm.uptime}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" title="View Details">
                              <Eye className="w-4 h-4 text-primary hover:text-secondary" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Edit className="w-4 h-4 text-light hover:text-dark" />
                            </Button>
                            {vm.status === "running" ? (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Stop"
                                onClick={() => handleVMAction(vm, "stop")}
                                disabled={updateVMMutation.isPending}
                              >
                                <Square className="w-4 h-4 text-error hover:text-red-700" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                title="Start"
                                onClick={() => handleVMAction(vm, "start")}
                                disabled={updateVMMutation.isPending}
                              >
                                <Play className="w-4 h-4 text-success hover:text-green-700" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {vms.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-light">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{vms.length}</span> of <span className="font-medium">{vms.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="default" size="sm" className="bg-primary text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateVMModal 
        isOpen={isCreateVMOpen} 
        onClose={() => setIsCreateVMOpen(false)} 
      />
    </>
  );
}
