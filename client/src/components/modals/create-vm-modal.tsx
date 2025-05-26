import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVirtualMachineSchema } from "@shared/schema";
import { api } from "@/lib/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2 } from "lucide-react";
import { z } from "zod";

interface CreateVMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const createVMSchema = insertVirtualMachineSchema.extend({
  name: z.string().min(1, "VM name is required"),
  template: z.string().min(1, "Template is required"),
  cpuCores: z.number().min(1).max(32),
  memory: z.number().min(1).max(128),
  storage: z.number().min(10).max(1000),
  network: z.string().min(1, "Network is required"),
});

type CreateVMFormData = z.infer<typeof createVMSchema>;

export function CreateVMModal({ isOpen, onClose }: CreateVMModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateVMFormData>({
    resolver: zodResolver(createVMSchema),
    defaultValues: {
      name: "",
      template: "",
      cpuCores: 2,
      memory: 4,
      storage: 120,
      network: "",
      status: "stopped",
      userId: 1, // Default admin user
    },
  });

  const createVMMutation = useMutation({
    mutationFn: (data: CreateVMFormData) => api.createVM(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "VM Created",
        description: "Virtual machine created successfully.",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create virtual machine.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateVMFormData) => {
    createVMMutation.mutate(data);
  };

  const templates = [
    "Ubuntu 22.04 LTS",
    "Ubuntu 20.04 LTS", 
    "CentOS 8",
    "CentOS 7",
    "Windows Server 2022",
    "Windows Server 2019",
    "Debian 11",
    "Red Hat Enterprise Linux 8"
  ];

  const networks = [
    "Default Network",
    "Production Network",
    "Development Network",
    "Staging Network",
    "Internal Network"
  ];

  const cpuOptions = [1, 2, 4, 8, 16, 32];
  const memoryOptions = [2, 4, 8, 16, 32, 64, 128];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-dark">
            Create Virtual Machine
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VM Name</FormLabel>
                    <FormControl>
                      <Input placeholder="vm-prod-04" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template} value={template}>
                            {template}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpuCores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Cores</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CPU cores" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cpuOptions.map((cpu) => (
                          <SelectItem key={cpu} value={cpu.toString()}>
                            {cpu} vCPUs
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select memory" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {memoryOptions.map((memory) => (
                          <SelectItem key={memory} value={memory.toString()}>
                            {memory}GB RAM
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage (GB)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="120" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="network"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {networks.map((network) => (
                          <SelectItem key={network} value={network}>
                            {network}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* AI Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-dark">AI Recommendation</h4>
                  <p className="text-sm text-light mt-1">
                    Based on your workload patterns, we recommend 4 vCPUs and 8GB RAM for optimal performance 
                    and cost efficiency. This configuration handles most production workloads effectively.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createVMMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createVMMutation.isPending}
                className="bg-primary hover:bg-secondary text-white"
              >
                {createVMMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Virtual Machine"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
