const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany({ where: { isActive: true } });
  console.log('Active locations:', locations.map(l => ({ id: l.id, name: l.name })));

  const vehicles = await prisma.vehicle.findMany({
    include: {
      inventory: {
        include: { location: true },
      },
    },
  });

  console.log('Vehicles with inventory:');
  for (const v of vehicles) {
    console.log(`${v.brand} ${v.model} (${v.id}): ${v.inventory.length} inventory records`);
    v.inventory.forEach(inv => {
      console.log(`  - Location: ${inv.location.name} (id: ${inv.locationId}), qty: ${inv.quantity}, active: ${inv.isActive}`);
    });
  }

  // If vehicles have no inventory, associate them with active locations so location filtering works end-to-end
  const unassignedVehicles = vehicles.filter(v => v.inventory.length === 0);
  if (unassignedVehicles.length > 0 && locations.length > 0) {
    console.log(`\nAssigning ${unassignedVehicles.length} vehicles to active locations...`);
    for (let i = 0; i < unassignedVehicles.length; i++) {
      const v = unassignedVehicles[i];
      // Assign across active locations:
      // Half to Goa Main Branch, half to Prime Rides Main Location, or all to both
      // For rich realistic catalog: assign vehicles to active locations
      for (const loc of locations) {
        await prisma.inventory.upsert({
          where: {
            vehicleId_locationId: {
              vehicleId: v.id,
              locationId: loc.id,
            },
          },
          update: {
            isActive: true,
            quantity: 2,
          },
          create: {
            vehicleId: v.id,
            locationId: loc.id,
            quantity: 2,
            isActive: true,
          },
        });
      }
    }
    console.log('Inventory assigned successfully!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
