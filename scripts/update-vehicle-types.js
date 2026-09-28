const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateVehicleTypes() {
  console.log("Updating vehicle types...");

  // Update based on real vehicle attributes
  await prisma.vehicle.updateMany({
    where: { brand: { contains: "BMW", mode: "insensitive" } },
    data: { vehicleType: "Luxury Sedan" }
  });

  await prisma.vehicle.updateMany({
    where: {
      OR: [
        { brand: { contains: "Skoda", mode: "insensitive" } },
        { model: { contains: "Kodiaq", mode: "insensitive" } }
      ]
    },
    data: { vehicleType: "Luxury SUV" }
  });

  await prisma.vehicle.updateMany({
    where: {
      OR: [
        { model: { contains: "Creta", mode: "insensitive" } },
        { model: { contains: "Hector", mode: "insensitive" } },
        { model: { contains: "XUV700", mode: "insensitive" } },
        { model: { contains: "Seltos", mode: "insensitive" } },
        { model: { contains: "Harrier", mode: "insensitive" } },
        { model: { contains: "Fortuner", mode: "insensitive" } }
      ]
    },
    data: { vehicleType: "SUV" }
  });

  await prisma.vehicle.updateMany({
    where: {
      OR: [
        { model: { contains: "Innova", mode: "insensitive" } },
        { model: { contains: "Carens", mode: "insensitive" } },
        { model: { contains: "Ertiga", mode: "insensitive" } },
        { model: { contains: "XL6", mode: "insensitive" } }
      ]
    },
    data: { vehicleType: "MUV/MPV" }
  });

  await prisma.vehicle.updateMany({
    where: {
      OR: [
        { model: { contains: "City", mode: "insensitive" } },
        { model: { contains: "Verna", mode: "insensitive" } },
        { model: { contains: "Slavia", mode: "insensitive" } },
        { model: { contains: "Virtus", mode: "insensitive" } },
        { model: { contains: "Ciaz", mode: "insensitive" } }
      ]
    },
    data: { vehicleType: "Sedan" }
  });

  await prisma.vehicle.updateMany({
    where: {
      OR: [
        { model: { contains: "i20", mode: "insensitive" } },
        { model: { contains: "Swift", mode: "insensitive" } },
        { model: { contains: "Baleno", mode: "insensitive" } },
        { model: { contains: "Altroz", mode: "insensitive" } }
      ]
    },
    data: { vehicleType: "Hatchback" }
  });

  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      brand: true,
      model: true,
      variant: true,
      vehicleType: true,
      fuelType: true,
      transmission: true,
      seatingCapacity: true,
      basePrice: true,
    }
  });

  console.log("=== UPDATED VEHICLE DATA ===");
  console.table(vehicles);
}

updateVehicleTypes()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
