import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================
  // Roles
  // =========================

  const adminRole = await prisma.role.upsert({
    where: {
      name: "ADMIN",
    },
    update: {},
    create: {
      name: "ADMIN",
      description: "Full access to the Prime Rides admin panel",
    },
  });

  const customerRole = await prisma.role.upsert({
    where: {
      name: "CUSTOMER",
    },
    update: {},
    create: {
      name: "CUSTOMER",
      description: "Regular Prime Rides customer",
    },
  });

  // =========================
  // Permissions
  // =========================

  const permissions = [
    {
      name: "VIEW_VEHICLES",
      description: "View vehicles",
    },
    {
      name: "CREATE_VEHICLES",
      description: "Create vehicles",
    },
    {
      name: "UPDATE_VEHICLES",
      description: "Update vehicles",
    },
    {
      name: "DELETE_VEHICLES",
      description: "Delete vehicles",
    },
    {
      name: "VIEW_BOOKINGS",
      description: "View bookings",
    },
    {
      name: "MANAGE_BOOKINGS",
      description: "Manage bookings",
    },
    {
      name: "VIEW_CUSTOMERS",
      description: "View customers",
    },
    {
      name: "MANAGE_CUSTOMERS",
      description: "Manage customers",
    },
  ];

  const createdPermissions = [];

  for (const permission of permissions) {
    const created = await prisma.permission.upsert({
      where: {
        name: permission.name,
      },
      update: {},
      create: permission,
    });

    createdPermissions.push(created);
  }

  // =========================
  // Assign Permissions to ADMIN
  // =========================

  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // =========================
  // Create Admin User
  // =========================

  const adminPassword = await bcrypt.hash("Admin@12345", 12);

  const adminUser = await prisma.user.upsert({
    where: {
      email: "admin@primerides.com",
    },
    update: {
      password: adminPassword,
      role: "ADMIN",
      name: "Rides Admin",
    },
    create: {
      name: "Rides Admin",
      email: "admin@primerides.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // =========================
  // Platform Stats
  // =========================
  const existingStats = await prisma.platformStat.count();
  if (existingStats === 0) {
    await prisma.platformStat.createMany({
      data: [
        {
          valueNumber: 100,
          prefix: "",
          suffix: "+",
          label: "Major cities in India with reliable self drive car rental options.",
          sortOrder: 1,
          isActive: true,
        },
        {
          valueNumber: 25,
          prefix: "",
          suffix: "M+",
          label: "Users trust Prime Rides for easy and affordable car rentals.",
          sortOrder: 2,
          isActive: true,
        },
        {
          valueNumber: 40,
          prefix: "",
          suffix: "K+",
          label: "Self-drive cars available across various categories to suit every travel need.",
          sortOrder: 3,
          isActive: true,
        },
        {
          valueNumber: 20,
          prefix: "",
          suffix: "K+",
          label: "Hosts offering a wide range of self drive cars.",
          sortOrder: 4,
          isActive: true,
        },
      ],
    });
    console.log("✅ Default platform stats seeded!");
  }

  console.log("✅ Roles created:", adminRole.name, customerRole.name);
  console.log(`✅ Permissions created: ${createdPermissions.length}`);
  console.log(`✅ Admin user created: ${adminUser.email}`);
  console.log("🌱 Seed completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });