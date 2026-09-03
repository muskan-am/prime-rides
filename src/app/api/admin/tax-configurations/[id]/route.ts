import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================
   GET - Get Single Tax Configuration
========================================= */

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session =
      await getServerSession(authOptions);

    if (
      !session?.user ||
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Tax configuration ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const taxConfiguration =
      await prisma.taxConfiguration.findUnique({
        where: {
          id,
        },
      });

    if (!taxConfiguration) {
      return NextResponse.json(
        {
          error:
            "Tax configuration not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      taxConfiguration,
    });
  } catch (error) {
    console.error(
      "Get Tax Configuration Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch tax configuration.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   PATCH - Update Tax Configuration
========================================= */

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    /* -----------------------------------------
       Authentication
    ----------------------------------------- */

    const session =
      await getServerSession(authOptions);

    if (
      !session?.user ||
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Get ID
    ----------------------------------------- */

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Tax configuration ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Check Existing Configuration
    ----------------------------------------- */

    const existing =
      await prisma.taxConfiguration.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Tax configuration not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------------------
       Read Request Body
    ----------------------------------------- */

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existing.name;

    const numericRate =
      body.rate !== undefined
        ? Number(body.rate)
        : Number(existing.rate);

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : existing.isActive;

    /* -----------------------------------------
       Validation
    ----------------------------------------- */

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Tax configuration name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      Number.isNaN(numericRate) ||
      numericRate < 0 ||
      numericRate > 100
    ) {
      return NextResponse.json(
        {
          error:
            "Tax rate must be between 0 and 100.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Prevent Multiple Active Configurations
    ----------------------------------------- */

    if (isActive) {
      const anotherActive =
        await prisma.taxConfiguration.findFirst({
          where: {
            isActive: true,

            NOT: {
              id,
            },
          },
        });

      if (anotherActive) {
        return NextResponse.json(
          {
            error:
              "Another active tax configuration already exists. Please deactivate it first.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /* -----------------------------------------
       Update
    ----------------------------------------- */

    const taxConfiguration =
      await prisma.taxConfiguration.update({
        where: {
          id,
        },

        data: {
          name,

          rate: new Prisma.Decimal(
            numericRate
          ),

          isActive,
        },
      });

    return NextResponse.json({
      message:
        "Tax configuration updated successfully.",

      taxConfiguration,
    });
  } catch (error) {
    console.error(
      "Update Tax Configuration Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the tax configuration.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   DELETE - Delete Tax Configuration
========================================= */

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    /* -----------------------------------------
       Authentication
    ----------------------------------------- */

    const session =
      await getServerSession(authOptions);

    if (
      !session?.user ||
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    /* -----------------------------------------
       Get ID
    ----------------------------------------- */

    const { id } =
      await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Tax configuration ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* -----------------------------------------
       Check Existing Configuration
    ----------------------------------------- */

    const existing =
      await prisma.taxConfiguration.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Tax configuration not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* -----------------------------------------
       Delete
    ----------------------------------------- */

    await prisma.taxConfiguration.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message:
        "Tax configuration deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Tax Configuration Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while deleting the tax configuration.",
      },
      {
        status: 500,
      }
    );
  }
}