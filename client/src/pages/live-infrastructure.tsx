import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/layout/header";
import { useToast } from "@/hooks/use-toast";
import { 
  Server, 
  Activity, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Network,
  Terminal,
  RefreshCw,
  Play,
  Square,
  Monitor,
  Container
} from "lucide-react";

const api = {
  getSystemInfo: () => fetch("/api/agent/system-info").then(res => res.json()),
  getMetrics: () => fetch("/api/agent/metrics").then(res => res.json()),
  getProcesses: (limit?: number) => fetch(`/api/agent/processes${limit ? `?limit=${limit}` : ""}`).then(res => res.json()),
  getServices: () => fetch("/api/agent/services").then(res => res.json()),
  getDockerContainers: () => fetch("/api/agent/docker").then(res => res.json()),
  executeCommand: (command: string, timeout?: number) => 
    fetch("/api/agent/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command, timeout })
    }).then(res => res.json()),
  restartService: (serviceName: string) =>
    fetch(`/api/agent/service/${serviceName}/restart`, {
      method: "POST"
    }).then(res => res.json()),
  checkPort: (port: number) => fetch(`/api/agent/port/${port}/check`).then(res => res.json())
};

export default function LiveInfrastructure() {
  const { toast } = useToast();
  const [command, setCommand] = useState("");
  const [commandOutput, setCommandOutput] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const { data: systemInfo, isLoading: systemLoading, refetch: refetchSystem } = useQuery({
    queryKey: ["/api/agent/system-info"],
    queryFn: api.getSystemInfo,
    refetchInterval: 30000
  });

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ["/api/agent/metrics"],
    queryFn: api.getMetrics,
    refetchInterval: 5000
  });

  const { data: processes, isLoading: processesLoading, refetch: refetchProcesses } = useQuery({
    queryKey: ["/api/agent/processes"],
    queryFn: () => api.getProcesses(15),
    refetchInterval: 10000
  });

  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ["/api/agent/services"],
    queryFn: api.getServices,
    refetchInterval: 30000
  });

  const { data: containers, isLoading: containersLoading, refetch: refetchContainers } = useQuery({
    queryKey: ["/api/agent/docker"],
    queryFn: api.getDockerContainers,
    refetchInterval: 15000
  });

  const executeCommandMutation = useMutation({
    mutationFn: ({ command, timeout }: { command: string; timeout?: number }) => 
      api.executeCommand(command, timeout),
    onSuccess: (data) => {
      setCommandOutput(data.stdout || data.stderr || "Command executed");
      if (!data.success) {
        toast({
          title: "Command Failed",
          description: data.stderr,
          variant: "destructive"
        });
      }
    }
  });

  const restartServiceMutation = useMutation({
    mutationFn: api.restartService,
    onSuccess: (data) => {
      toast({
        title: data.success ? "Service Restarted" : "Restart Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
      if (data.success) {
        refetchServices();
      }
    }
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': case 'running': return 'bg-green-500';
      case 'failed': case 'stopped': return 'bg-red-500';
      case 'inactive': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (systemLoading || metricsLoading) {
    return (
      <div className="p-6">
        <Header 
          title="Live Infrastructure" 
          subtitle="Real-time system monitoring and management" 
        />
        <div className="mt-6 space-y-4">
          <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header 
        title="Live Infrastructure" 
        subtitle="Real-time system monitoring and management" 
      />

      {/* System Overview */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Info</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.hostname}</div>
            <p className="text-xs text-muted-foreground">
              {systemInfo?.platform} {systemInfo?.arch}
            </p>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemInfo?.uptime ? formatUptime(systemInfo.uptime) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.cpu?.usage?.toFixed(1) || '0'}%
            </div>
            <Progress value={metrics?.cpu?.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {metrics?.cpu?.cores} cores - {metrics?.cpu?.model || 'Unknown CPU'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.memory?.usage?.toFixed(1) || '0'}%
            </div>
            <Progress value={metrics?.memory?.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(metrics?.memory?.used || 0)} / {formatBytes(metrics?.memory?.total || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.disk?.usage?.toFixed(1) || '0'}%
            </div>
            <Progress value={metrics?.disk?.usage || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(metrics?.disk?.used || 0)} / {formatBytes(metrics?.disk?.total || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Views */}
      <div className="mt-8">
        <Tabs defaultValue="processes">
          <TabsList>
            <TabsTrigger value="processes">Running Processes</TabsTrigger>
            <TabsTrigger value="services">System Services</TabsTrigger>
            <TabsTrigger value="containers">Docker Containers</TabsTrigger>
            <TabsTrigger value="terminal">Command Terminal</TabsTrigger>
          </TabsList>

          <TabsContent value="processes" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Processes by CPU Usage</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchProcesses()}
                  disabled={processesLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${processesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {processes?.map((process: any, index: number) => (
                    <div key={process.pid} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{process.name}</div>
                        <div className="text-sm text-gray-500">PID: {process.pid}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{process.cpu.toFixed(1)}% CPU</div>
                        <div className="text-sm text-gray-500">{process.memory.toFixed(1)}% MEM</div>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {process.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Services</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchServices()}
                  disabled={servicesLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${servicesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services?.map((service: any, index: number) => (
                    <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500">{service.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)}`} />
                        <Badge variant="outline">{service.status}</Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => restartServiceMutation.mutate(service.name)}
                          disabled={restartServiceMutation.isPending}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Restart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="containers" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Docker Containers</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => refetchContainers()}
                  disabled={containersLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${containersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {containers?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Container className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No Docker containers found</p>
                    <p className="text-sm">Docker may not be installed or running</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {containers?.map((container: any, index: number) => (
                      <div key={container.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="font-medium">{container.name}</div>
                          <div className="text-sm text-gray-500">{container.image}</div>
                          <div className="text-xs text-gray-400">{container.id.substring(0, 12)}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{container.status}</Badge>
                          {container.ports && (
                            <div className="text-xs text-gray-500 mt-1">{container.ports}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terminal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Terminal className="h-5 w-5 mr-2" />
                  Command Terminal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter command..."
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && command.trim()) {
                        executeCommandMutation.mutate({ command });
                        setCommand("");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (command.trim()) {
                        executeCommandMutation.mutate({ command });
                        setCommand("");
                      }
                    }}
                    disabled={executeCommandMutation.isPending || !command.trim()}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                </div>
                
                {commandOutput && (
                  <div>
                    <label className="text-sm font-medium">Output:</label>
                    <Textarea
                      value={commandOutput}
                      readOnly
                      className="mt-1 font-mono text-sm bg-gray-900 text-green-400"
                      rows={10}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}