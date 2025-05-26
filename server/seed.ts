import { db } from "./db";
import { users, virtualMachines, alerts, systemMetrics } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        password: "admin123",
        email: "admin@cloudai.com",
        role: "admin",
      })
      .returning()
      .onConflictDoNothing();

    console.log("✓ Admin user created");

    // Create initial VMs
    const initialVMs = [
      {
        name: "vm-prod-01",
        status: "running",
        template: "Ubuntu 22.04 LTS",
        cpuCores: 4,
        memory: 8,
        storage: 120,
        network: "Production Network",
        cpuUsage: 65,
        memoryUsage: 72,
        uptime: "12d 4h",
        userId: adminUser?.id || 1,
      },
      {
        name: "vm-dev-02",
        status: "maintenance",
        template: "CentOS 8",
        cpuCores: 2,
        memory: 4,
        storage: 80,
        network: "Development Network",
        cpuUsage: 45,
        memoryUsage: 58,
        uptime: "6d 2h",
        userId: adminUser?.id || 1,
      },
      {
        name: "vm-backup-03",
        status: "running",
        template: "Ubuntu 22.04 LTS",
        cpuCores: 8,
        memory: 16,
        storage: 500,
        network: "Default Network",
        cpuUsage: 32,
        memoryUsage: 41,
        uptime: "25d 8h",
        userId: adminUser?.id || 1,
      },
    ];

    await db.insert(virtualMachines).values(initialVMs).onConflictDoNothing();
    console.log("✓ Virtual machines created");

    // Create initial alerts
    const initialAlerts = [
      {
        type: "warning",
        title: "High CPU Usage",
        message: "vm-prod-01 CPU usage is above 80% for the last 10 minutes",
        severity: "medium",
        isRead: false,
        resourceId: 1,
        resourceType: "vm",
      },
      {
        type: "error",
        title: "Storage Almost Full",
        message: "Storage pool is at 85% capacity",
        severity: "high",
        isRead: false,
        resourceId: null,
        resourceType: "storage",
      },
      {
        type: "info",
        title: "Security Update Available",
        message: "Critical security patches available for 3 servers",
        severity: "medium",
        isRead: false,
        resourceId: null,
        resourceType: "server",
      },
    ];

    await db.insert(alerts).values(initialAlerts).onConflictDoNothing();
    console.log("✓ Alerts created");

    // Create initial system metrics
    const metrics = {
      totalServers: 24,
      storageUsed: 2.4,
      storageTotal: 3.2,
      networkTraffic: 1.2,
      healthScore: 94,
      cpuUsageAvg: 65,
      memoryUsageAvg: 58,
    };

    await db.insert(systemMetrics).values(metrics).onConflictDoNothing();
    console.log("✓ System metrics created");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}