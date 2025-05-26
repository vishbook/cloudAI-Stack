export interface DashboardStats {
  totalServers: number;
  storageUsed: string;
  storagePercent: number;
  networkTraffic: string;
  healthScore: string;
  serverGrowth: string;
  networkGrowth: string;
  alertsCount: number;
}

export interface ChartDataPoint {
  name: string;
  cpu?: number;
  memory?: number;
  storage?: number;
  value?: number;
}

export interface AIRecommendation {
  id: number;
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority: string;
  status: string;
  resourceId?: number;
  resourceType?: string;
  createdAt: Date;
}

export interface QuickAction {
  icon: string;
  title: string;
  description?: string;
  color: string;
  action: () => void;
}
