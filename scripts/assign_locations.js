const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany({ where: { isActive: true } });
  console.log('Available Locations:', locations.map(l => ({ id: l.id, name: l.name })));

  const goaLoc = locations.find(l => l.name.toLowerCase().includes('goa'));
  const mainLoc = locations.find(l => !l.name.toLowerCase().includes('goa')) || locations[0];

  if (!goaLoc || !mainLoc) {
    console.log('Could not find both locations.');
    return;
  }

  // Clear existing inventory
  await prisma.inventory.deleteMany({});
  console.log('Cleared existing inventory.');

  const vehicles = await prisma.vehicle.findMany();

  // Distribute cars:
  // Goa Main Branch: Creta, Fortuner, XUV700, Seltos
  // Prime Rides Main Location: BMW 3 Series, Skoda Kodiaq, MG Hector, Tata Harrier
  const goaCars = ['Creta', 'Fortuner', 'XUV700', 'Seltos'];

  for (const v of vehicles) {
    const isGoa = goaCars.some(name => v.model.toLowerCase().includes(name.toLowerCase()));
    const assignedLoc = isGoa ? goaLoc : mainLoc;

    await prisma.inventory.create({
      data: {
        vehicleId: v.id,
        locationId: assignedLoc.id,
        quantity: 2,
        isActive: true,
      },
    });

    console.log(`Assigned ${v.brand} ${v.model} -> ${assignedLoc.name}`);
  }

  console.log('Done assigning vehicles to distinct locations!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
