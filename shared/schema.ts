import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const virtualMachines = pgTable("virtual_machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull(),
  template: text("template").notNull(),
  cpuCores: integer("cpu_cores").notNull(),
  memory: integer("memory").notNull(), // in GB
  storage: integer("storage").notNull(), // in GB
  network: text("network").notNull(),
  cpuUsage: real("cpu_usage").notNull().default(0),
  memoryUsage: real("memory_usage").notNull().default(0),
  uptime: text("uptime").notNull().default("0d 0h"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'warning', 'error', 'info'
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  isRead: boolean("is_read").notNull().default(false),
  resourceId: integer("resource_id"),
  resourceType: text("resource_type"), // 'vm', 'server', 'storage'
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'optimization', 'security', 'capacity'
  title: text("title").notNull(),
  description: text("description").notNull(),
  confidence: real("confidence").notNull(),
  priority: text("priority").notNull(), // 'low', 'medium', 'high'
  status: text("status").notNull().default("pending"), // 'pending', 'applied', 'dismissed'
  resourceId: integer("resource_id"),
  resourceType: text("resource_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  totalServers: integer("total_servers").notNull(),
  storageUsed: real("storage_used").notNull(), // in TB
  storageTotal: real("storage_total").notNull(), // in TB
  networkTraffic: real("network_traffic").notNull(), // in GB/s
  healthScore: real("health_score").notNull(),
  cpuUsageAvg: real("cpu_usage_avg").notNull(),
  memoryUsageAvg: real("memory_usage_avg").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVirtualMachineSchema = createInsertSchema(virtualMachines).omit({
  id: true,
  createdAt: true,
  cpuUsage: true,
  memoryUsage: true,
  uptime: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertSystemMetricsSchema = createInsertSchema(systemMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type VirtualMachine = typeof virtualMachines.$inferSelect;
export type InsertVirtualMachine = z.infer<typeof insertVirtualMachineSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;

export type SystemMetrics = typeof systemMetrics.$inferSelect;
export type InsertSystemMetrics = z.infer<typeof insertSystemMetricsSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
