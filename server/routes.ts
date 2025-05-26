import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeInfrastructure, generateOptimizationSuggestions, predictResourceNeeds } from "./ai";
import { agent } from "./agent";
import { insertVirtualMachineSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const vms = await storage.getVirtualMachines();
      const metrics = await storage.getLatestSystemMetrics();
      const alerts = await storage.getUnreadAlerts();

      const stats = {
        totalServers: metrics?.totalServers || vms.length,
        storageUsed: `${metrics?.storageUsed || 2.4}TB`,
        storagePercent: Math.round(((metrics?.storageUsed || 2.4) / (metrics?.storageTotal || 3.2)) * 100),
        networkTraffic: `${metrics?.networkTraffic || 1.2}GB/s`,
        healthScore: `${metrics?.healthScore || 94}%`,
        serverGrowth: "12%",
        networkGrowth: "8%",
        alertsCount: alerts.length
      };

      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to load dashboard stats" });
    }
  });

  // Virtual Machines endpoints
  app.get("/api/vms", async (_req, res) => {
    try {
      const vms = await storage.getVirtualMachines();
      res.json(vms);
    } catch (error) {
      console.error("Get VMs error:", error);
      res.status(500).json({ message: "Failed to load virtual machines" });
    }
  });

  app.get("/api/vms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vm = await storage.getVirtualMachine(id);
      
      if (!vm) {
        return res.status(404).json({ message: "Virtual machine not found" });
      }
      
      res.json(vm);
    } catch (error) {
      console.error("Get VM error:", error);
      res.status(500).json({ message: "Failed to load virtual machine" });
    }
  });

  app.post("/api/vms", async (req, res) => {
    try {
      const validatedData = insertVirtualMachineSchema.parse(req.body);
      const vm = await storage.createVirtualMachine(validatedData);
      res.status(201).json(vm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid VM data", errors: error.errors });
      }
      console.error("Create VM error:", error);
      res.status(500).json({ message: "Failed to create virtual machine" });
    }
  });

  app.patch("/api/vms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const vm = await storage.updateVirtualMachine(id, updates);
      if (!vm) {
        return res.status(404).json({ message: "Virtual machine not found" });
      }
      
      res.json(vm);
    } catch (error) {
      console.error("Update VM error:", error);
      res.status(500).json({ message: "Failed to update virtual machine" });
    }
  });

  app.delete("/api/vms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVirtualMachine(id);
      
      if (!success) {
        return res.status(404).json({ message: "Virtual machine not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete VM error:", error);
      res.status(500).json({ message: "Failed to delete virtual machine" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({ message: "Failed to load alerts" });
    }
  });

  app.get("/api/alerts/unread", async (_req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get unread alerts error:", error);
      res.status(500).json({ message: "Failed to load unread alerts" });
    }
  });

  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markAlertAsRead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Mark alert read error:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // AI Recommendations endpoints
  app.get("/api/ai/recommendations", async (_req, res) => {
    try {
      const recommendations = await storage.getPendingRecommendations();
      res.json(recommendations);
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ message: "Failed to load AI recommendations" });
    }
  });

  app.post("/api/ai/analyze", async (_req, res) => {
    try {
      const vms = await storage.getVirtualMachines();
      const metrics = await storage.getLatestSystemMetrics();
      const alerts = await storage.getUnreadAlerts();

      const analysis = await analyzeInfrastructure(vms, metrics, alerts);

      // Store new recommendations
      for (const rec of analysis.recommendations) {
        await storage.createAiRecommendation({
          type: rec.type,
          title: rec.title,
          description: rec.description,
          confidence: rec.confidence,
          priority: rec.priority,
          resourceId: rec.resourceId,
          resourceType: rec.resourceType,
          status: "pending"
        });
      }

      res.json(analysis);
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ message: "Failed to perform AI analysis" });
    }
  });

  app.post("/api/ai/optimize/:vmId", async (req, res) => {
    try {
      const vmId = parseInt(req.params.vmId);
      const vm = await storage.getVirtualMachine(vmId);
      
      if (!vm) {
        return res.status(404).json({ message: "Virtual machine not found" });
      }

      const suggestion = await generateOptimizationSuggestions(vm);
      res.json({ suggestion });
    } catch (error) {
      console.error("VM optimization error:", error);
      res.status(500).json({ message: "Failed to generate optimization suggestions" });
    }
  });

  app.patch("/api/ai/recommendations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const success = await storage.updateRecommendationStatus(id, status);
      if (!success) {
        return res.status(404).json({ message: "Recommendation not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update recommendation error:", error);
      res.status(500).json({ message: "Failed to update recommendation" });
    }
  });

  // System Metrics endpoints
  app.get("/api/metrics/current", async (_req, res) => {
    try {
      const metrics = await storage.getLatestSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Get current metrics error:", error);
      res.status(500).json({ message: "Failed to load current metrics" });
    }
  });

  app.get("/api/metrics/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const metrics = await storage.getSystemMetrics(limit);
      res.json(metrics);
    } catch (error) {
      console.error("Get metrics history error:", error);
      res.status(500).json({ message: "Failed to load metrics history" });
    }
  });

  app.post("/api/metrics/predict", async (_req, res) => {
    try {
      const historicalData = await storage.getSystemMetrics(30);
      const predictions = await predictResourceNeeds(historicalData);
      res.json(predictions);
    } catch (error) {
      console.error("Resource prediction error:", error);
      res.status(500).json({ message: "Failed to generate resource predictions" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (_req, res) => {
    try {
      const openaiApiKey = await storage.getSetting("openai_api_key");
      res.json({ 
        openaiApiKey: openaiApiKey || "" 
      });
    } catch (error) {
      console.error("Get settings error:", error);
      res.status(500).json({ message: "Failed to load settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { openaiApiKey } = req.body;
      
      if (openaiApiKey) {
        await storage.setSetting("openai_api_key", openaiApiKey);
        // Update the environment variable for immediate use
        process.env.OPENAI_API_KEY = openaiApiKey;
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/settings/test-openai", async (_req, res) => {
    try {
      const openaiApiKey = await storage.getSetting("openai_api_key");
      if (!openaiApiKey) {
        return res.status(400).json({ message: "OpenAI API key not configured" });
      }

      // Test the OpenAI connection
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: openaiApiKey });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5
      });

      res.json({ 
        success: true, 
        model: "gpt-4o",
        message: "Connection successful"
      });
    } catch (error: any) {
      console.error("OpenAI test error:", error);
      res.status(400).json({ 
        message: error.message || "Failed to connect to OpenAI API" 
      });
    }
  });

  // Chart data endpoints
  app.get("/api/charts/resource-usage", async (_req, res) => {
    try {
      const metrics = await storage.getSystemMetrics(7);
      
      const chartData = metrics.reverse().map((metric, index) => ({
        name: `Day ${index + 1}`,
        cpu: metric.cpuUsageAvg,
        memory: metric.memoryUsageAvg,
        storage: Math.round((metric.storageUsed / metric.storageTotal) * 100)
      }));

      res.json(chartData);
    } catch (error) {
      console.error("Resource usage chart error:", error);
      res.status(500).json({ message: "Failed to load resource usage data" });
    }
  });

  app.get("/api/charts/health", async (_req, res) => {
    try {
      const vms = await storage.getVirtualMachines();
      const healthData = {
        healthy: vms.filter(vm => vm.status === "running").length,
        warning: vms.filter(vm => vm.status === "maintenance").length,
        critical: vms.filter(vm => vm.status === "error" || vm.status === "stopped").length
      };

      const total = healthData.healthy + healthData.warning + healthData.critical;
      
      const chartData = [
        { name: "Healthy", value: total > 0 ? Math.round((healthData.healthy / total) * 100) : 0 },
        { name: "Warning", value: total > 0 ? Math.round((healthData.warning / total) * 100) : 0 },
        { name: "Critical", value: total > 0 ? Math.round((healthData.critical / total) * 100) : 0 }
      ];

      res.json(chartData);
    } catch (error) {
      console.error("Health chart error:", error);
      res.status(500).json({ message: "Failed to load health data" });
    }
  });

  const httpServer = createServer(app);
  // Infrastructure Agent endpoints
  app.get("/api/agent/system-info", async (_req, res) => {
    try {
      const systemInfo = await agent.getSystemInfo();
      res.json(systemInfo);
    } catch (error) {
      console.error("System info error:", error);
      res.status(500).json({ message: "Failed to get system information" });
    }
  });

  app.get("/api/agent/metrics", async (_req, res) => {
    try {
      const metrics = await agent.getResourceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Resource metrics error:", error);
      res.status(500).json({ message: "Failed to get resource metrics" });
    }
  });

  app.get("/api/agent/processes", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const processes = await agent.getRunningProcesses(limit);
      res.json(processes);
    } catch (error) {
      console.error("Processes error:", error);
      res.status(500).json({ message: "Failed to get running processes" });
    }
  });

  app.get("/api/agent/services", async (_req, res) => {
    try {
      const services = await agent.getSystemServices();
      res.json(services);
    } catch (error) {
      console.error("Services error:", error);
      res.status(500).json({ message: "Failed to get system services" });
    }
  });

  app.get("/api/agent/docker", async (_req, res) => {
    try {
      const containers = await agent.getDockerContainers();
      res.json(containers);
    } catch (error) {
      console.error("Docker containers error:", error);
      res.status(500).json({ message: "Failed to get Docker containers" });
    }
  });

  app.post("/api/agent/command", async (req, res) => {
    try {
      const { command, timeout } = req.body;
      if (!command) {
        return res.status(400).json({ message: "Command is required" });
      }
      
      const result = await agent.executeCommand(command, timeout);
      res.json(result);
    } catch (error) {
      console.error("Command execution error:", error);
      res.status(500).json({ message: "Failed to execute command" });
    }
  });

  app.post("/api/agent/service/:serviceName/restart", async (req, res) => {
    try {
      const { serviceName } = req.params;
      const result = await agent.restartService(serviceName);
      res.json(result);
    } catch (error) {
      console.error("Service restart error:", error);
      res.status(500).json({ message: "Failed to restart service" });
    }
  });

  app.get("/api/agent/port/:port/check", async (req, res) => {
    try {
      const port = parseInt(req.params.port);
      const available = await agent.checkPortAvailability(port);
      res.json({ port, available });
    } catch (error) {
      console.error("Port check error:", error);
      res.status(500).json({ message: "Failed to check port availability" });
    }
  });

  return httpServer;
}
