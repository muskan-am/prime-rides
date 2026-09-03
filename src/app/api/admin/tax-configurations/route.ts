import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";

import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

/* =========================================
   GET - Get All Tax Configurations
========================================= */

export async function GET() {
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

    const taxConfigurations =
      await prisma.taxConfiguration.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      taxConfigurations,
    });
  } catch (error) {
    console.error(
      "Get Tax Configurations Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch tax configurations.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   POST - Create Tax Configuration
========================================= */

export async function POST(
  request: Request
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
       Read Request Body
    ----------------------------------------- */

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const rate =
      body.rate !== undefined
        ? String(body.rate).trim()
        : "";

    const isActive =
      body.isActive !== undefined
        ? Boolean(body.isActive)
        : true;

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

    if (!rate) {
      return NextResponse.json(
        {
          error:
            "Tax rate is required.",
        },
        {
          status: 400,
        }
      );
    }

    const numericRate =
      Number(rate);

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
       Prevent Duplicate Active Configuration
    ----------------------------------------- */

    if (isActive) {
      const existingActive =
        await prisma.taxConfiguration.findFirst({
          where: {
            isActive: true,
          },
        });

      if (existingActive) {
        return NextResponse.json(
          {
            error:
              "An active tax configuration already exists. Please deactivate it before creating another active configuration.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /* -----------------------------------------
       Create Tax Configuration
    ----------------------------------------- */

    const taxConfiguration =
      await prisma.taxConfiguration.create({
        data: {
          name,

          rate: new Prisma.Decimal(
            numericRate
          ),

          isActive,
        },
      });

    return NextResponse.json(
      {
        message:
          "Tax configuration created successfully.",

        taxConfiguration,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create Tax Configuration Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the tax configuration.",
      },
      {
        status: 500,
      }
    );
  }
}