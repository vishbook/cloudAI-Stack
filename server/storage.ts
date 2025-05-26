import { 
  users, 
  virtualMachines, 
  alerts, 
  aiRecommendations, 
  systemMetrics,
  settings,
  type User, 
  type InsertUser, 
  type VirtualMachine, 
  type InsertVirtualMachine,
  type Alert,
  type InsertAlert,
  type AiRecommendation,
  type InsertAiRecommendation,
  type SystemMetrics,
  type InsertSystemMetrics,
  type Settings,
  type InsertSettings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Virtual Machines
  getVirtualMachines(): Promise<VirtualMachine[]>;
  getVirtualMachine(id: number): Promise<VirtualMachine | undefined>;
  createVirtualMachine(vm: InsertVirtualMachine): Promise<VirtualMachine>;
  updateVirtualMachine(id: number, updates: Partial<VirtualMachine>): Promise<VirtualMachine | undefined>;
  deleteVirtualMachine(id: number): Promise<boolean>;
  
  // Alerts
  getAlerts(): Promise<Alert[]>;
  getUnreadAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<boolean>;
  
  // AI Recommendations
  getAiRecommendations(): Promise<AiRecommendation[]>;
  getPendingRecommendations(): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  updateRecommendationStatus(id: number, status: string): Promise<boolean>;
  
  // System Metrics
  getLatestSystemMetrics(): Promise<SystemMetrics | undefined>;
  getSystemMetrics(limit?: number): Promise<SystemMetrics[]>;
  createSystemMetrics(metrics: InsertSystemMetrics): Promise<SystemMetrics>;
  
  // Settings
  getSetting(key: string): Promise<string | undefined>;
  setSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getVirtualMachines(): Promise<VirtualMachine[]> {
    return await db.select().from(virtualMachines);
  }

  async getVirtualMachine(id: number): Promise<VirtualMachine | undefined> {
    const [vm] = await db.select().from(virtualMachines).where(eq(virtualMachines.id, id));
    return vm || undefined;
  }

  async createVirtualMachine(insertVm: InsertVirtualMachine): Promise<VirtualMachine> {
    const [vm] = await db
      .insert(virtualMachines)
      .values(insertVm)
      .returning();
    return vm;
  }

  async updateVirtualMachine(id: number, updates: Partial<VirtualMachine>): Promise<VirtualMachine | undefined> {
    const [vm] = await db
      .update(virtualMachines)
      .set(updates)
      .where(eq(virtualMachines.id, id))
      .returning();
    return vm || undefined;
  }

  async deleteVirtualMachine(id: number): Promise<boolean> {
    const result = await db.delete(virtualMachines).where(eq(virtualMachines.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(alerts.createdAt);
  }

  async getUnreadAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.isRead, false)).orderBy(alerts.createdAt);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAiRecommendations(): Promise<AiRecommendation[]> {
    return await db.select().from(aiRecommendations).orderBy(aiRecommendations.createdAt);
  }

  async getPendingRecommendations(): Promise<AiRecommendation[]> {
    return await db.select().from(aiRecommendations).where(eq(aiRecommendations.status, "pending")).orderBy(aiRecommendations.createdAt);
  }

  async createAiRecommendation(insertRec: InsertAiRecommendation): Promise<AiRecommendation> {
    const [recommendation] = await db
      .insert(aiRecommendations)
      .values(insertRec)
      .returning();
    return recommendation;
  }

  async updateRecommendationStatus(id: number, status: string): Promise<boolean> {
    const result = await db
      .update(aiRecommendations)
      .set({ status })
      .where(eq(aiRecommendations.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getLatestSystemMetrics(): Promise<SystemMetrics | undefined> {
    const [metrics] = await db.select().from(systemMetrics).orderBy(systemMetrics.timestamp).limit(1);
    return metrics || undefined;
  }

  async getSystemMetrics(limit = 50): Promise<SystemMetrics[]> {
    return await db.select().from(systemMetrics).orderBy(systemMetrics.timestamp).limit(limit);
  }

  async createSystemMetrics(insertMetrics: InsertSystemMetrics): Promise<SystemMetrics> {
    const [metrics] = await db
      .insert(systemMetrics)
      .values(insertMetrics)
      .returning();
    return metrics;
  }

  async getSetting(key: string): Promise<string | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting?.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      });
  }
}

export const storage = new DatabaseStorage();
