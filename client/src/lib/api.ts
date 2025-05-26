import { apiRequest } from "./queryClient";

export const api = {
  // Dashboard
  getDashboardStats: () => fetch("/api/dashboard/stats").then(res => res.json()),
  
  // Virtual Machines
  getVMs: () => fetch("/api/vms").then(res => res.json()),
  getVM: (id: number) => fetch(`/api/vms/${id}`).then(res => res.json()),
  createVM: (data: any) => apiRequest("POST", "/api/vms", data),
  updateVM: (id: number, data: any) => apiRequest("PATCH", `/api/vms/${id}`, data),
  deleteVM: (id: number) => apiRequest("DELETE", `/api/vms/${id}`),
  
  // Alerts
  getAlerts: () => fetch("/api/alerts").then(res => res.json()),
  getUnreadAlerts: () => fetch("/api/alerts/unread").then(res => res.json()),
  markAlertRead: (id: number) => apiRequest("PATCH", `/api/alerts/${id}/read`),
  
  // AI Recommendations
  getRecommendations: () => fetch("/api/ai/recommendations").then(res => res.json()),
  analyzeInfrastructure: () => apiRequest("POST", "/api/ai/analyze"),
  optimizeVM: (vmId: number) => apiRequest("POST", `/api/ai/optimize/${vmId}`),
  updateRecommendation: (id: number, status: string) => 
    apiRequest("PATCH", `/api/ai/recommendations/${id}`, { status }),
  
  // Metrics
  getCurrentMetrics: () => fetch("/api/metrics/current").then(res => res.json()),
  getMetricsHistory: (limit?: number) => 
    fetch(`/api/metrics/history${limit ? `?limit=${limit}` : ""}`).then(res => res.json()),
  predictResources: () => apiRequest("POST", "/api/metrics/predict"),
  
  // Charts
  getResourceUsageData: () => fetch("/api/charts/resource-usage").then(res => res.json()),
  getHealthData: () => fetch("/api/charts/health").then(res => res.json()),
  
  // Settings
  getSettings: () => fetch("/api/settings").then(res => res.json()),
  updateSettings: (data: any) => apiRequest("POST", "/api/settings", data),
  testOpenAIConnection: () => apiRequest("POST", "/api/settings/test-openai"),
};
