import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany();

  return Response.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      role: "CUSTOMER",
    },
  });

  return Response.json(user, {
    status: 201,
  });
}

export async function PATCH(request: Request){
    const body = await request.json();

    const user = await prisma.user.update({
        where: {
            id: body.id,
        },
        data: {
            name: body.name,
        },
    });

    return Response.json(user);
}

export async function DELETE(request: Request){
    const body = await request.json();

    const user = await prisma.user.delete({
        where: {
            id: body.id,
        },
    });

    return Response.json(user);
}