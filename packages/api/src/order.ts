import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

type OrderRecord = {
  id: string;
  orderNumber: string;
  publishRecordId: string;
  publishRecord: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
  buyerId: string;
  priceAicc: unknown;
  licenseType: string;
  txHash: string | null;
  status: string;
  statusMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PrismaLike = {
  order: {
    findMany: (args: {
      where?: Record<string, unknown>;
      include?: { publishRecord: { select: { id: boolean; title: boolean; imageUrl: boolean } } };
      orderBy?: Record<string, string>;
      skip?: number;
      take?: number;
    }) => Promise<OrderRecord[]>;
    findUnique: (args: {
      where: { id: string } | { orderNumber: string };
      include?: { publishRecord: { select: { id: boolean; title: boolean; imageUrl: boolean } } };
    }) => Promise<OrderRecord | null>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    create: (args: { data: Record<string, unknown> }) => Promise<OrderRecord>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<OrderRecord>;
    delete: (args: { where: { id: string } }) => Promise<OrderRecord>;
  };
  publishRecord: {
    findUnique: (args: { where: { id: string } }) => Promise<{ id: string; title: string; priceAicc: unknown; licenseType: string } | null>;
  };
};

type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

type AppEnv = {
  Variables: {
    user: SessionUser | null;
  };
};

export type OrderRoutesDeps = {
  prisma: PrismaLike;
};

const createOrderSchema = z.object({
  publishRecordId: z.string().min(1),
  txHash: z.string().optional(),
  licenseType: z.enum(["standard", "extended", "exclusive"]).optional()
});

const updateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "failed"]).optional(),
  statusMessage: z.string().optional(),
  txHash: z.string().optional()
});

const ordersQuerySchema = z.object({
  status: z.enum(["pending", "confirmed", "failed"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20)
});

const checkPurchaseSchema = z.object({
  publishRecordId: z.string().min(1)
});

const batchCheckPurchaseSchema = z.object({
  publishRecordIds: z.array(z.string().min(1)).min(1).max(100)
});

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function createOrderRoutes({ prisma }: OrderRoutesDeps) {
  const orders = new Hono<AppEnv>();

  // List orders for current user
  orders.get("/", zValidator("query", ordersQuerySchema), async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const query = c.req.valid("query");
    const { status, page, limit } = query;

    const where: Record<string, unknown> = { buyerId: user.id };
    if (status) {
      where.status = status;
    }

    const total = await prisma.order.count({ where });
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const orderRecords = await prisma.order.findMany({
      where,
      include: {
        publishRecord: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit
    });

    const orders = orderRecords.map((record) => ({
      id: record.id,
      orderNumber: record.orderNumber,
      creativeTitle: record.publishRecord.title,
      imageUrl: record.publishRecord.imageUrl,
      licenseType: record.licenseType,
      priceAicc: String(record.priceAicc),
      status: record.status,
      statusMessage: record.statusMessage,
      txHash: record.txHash,
      createdAt: record.createdAt.toISOString()
    }));

    return c.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  });

  // Check if user has purchased a specific listing
  orders.get("/check-purchase", zValidator("query", checkPurchaseSchema), async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const { publishRecordId } = c.req.valid("query");

    // Find a confirmed order for this user and publish record
    const existingOrder = await prisma.order.findMany({
      where: {
        buyerId: user.id,
        publishRecordId,
        status: "confirmed"
      },
      include: {
        publishRecord: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      },
      take: 1
    });

    if (existingOrder.length > 0) {
      const record = existingOrder[0];
      return c.json({
        purchased: true,
        order: {
          id: record.id,
          orderNumber: record.orderNumber,
          licenseType: record.licenseType,
          createdAt: record.createdAt.toISOString()
        }
      });
    }

    return c.json({ purchased: false });
  });

  // Batch check if user has purchased multiple listings
  orders.post("/batch-check-purchase", zValidator("json", batchCheckPurchaseSchema), async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const { publishRecordIds } = c.req.valid("json");

    // Find all confirmed orders for this user and the given publish records
    const existingOrders = await prisma.order.findMany({
      where: {
        buyerId: user.id,
        publishRecordId: { in: publishRecordIds },
        status: "confirmed"
      },
      include: {
        publishRecord: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      }
    });

    // Create a map of publishRecordId -> purchased status
    const purchasedMap: Record<string, boolean> = {};
    for (const id of publishRecordIds) {
      purchasedMap[id] = existingOrders.some(order => order.publishRecordId === id);
    }

    return c.json({ purchasedMap });
  });

  // Get single order by ID
  orders.get("/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const { id } = c.req.param();

    const record = await prisma.order.findUnique({
      where: { id },
      include: {
        publishRecord: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      }
    });

    if (!record) {
      return c.json({ error: "not_found" }, 404);
    }

    // Ensure user can only access their own orders
    if (record.buyerId !== user.id) {
      return c.json({ error: "forbidden" }, 403);
    }

    const order = {
      id: record.id,
      orderNumber: record.orderNumber,
      creativeTitle: record.publishRecord.title,
      imageUrl: record.publishRecord.imageUrl,
      licenseType: record.licenseType,
      priceAicc: String(record.priceAicc),
      status: record.status,
      statusMessage: record.statusMessage,
      txHash: record.txHash,
      createdAt: record.createdAt.toISOString()
    };

    return c.json({ order });
  });

  // Create a new order (called after payment)
  orders.post("/", zValidator("json", createOrderSchema), async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const input = c.req.valid("json");

    // Get the publish record to get price info
    const publishRecord = await prisma.publishRecord.findUnique({
      where: { id: input.publishRecordId }
    });

    if (!publishRecord) {
      return c.json({ error: "publish_record_not_found" }, 404);
    }

    const orderNumber = generateOrderNumber();
    const licenseType = input.licenseType ?? publishRecord.licenseType;

    const record = await prisma.order.create({
      data: {
        orderNumber,
        publishRecordId: input.publishRecordId,
        buyerId: user.id,
        priceAicc: publishRecord.priceAicc,
        licenseType,
        txHash: input.txHash,
        status: input.txHash ? "pending" : "pending"
      }
    });

    return c.json({
      order: {
        id: record.id,
        orderNumber: record.orderNumber,
        status: record.status,
        createdAt: record.createdAt.toISOString()
      }
    }, 201);
  });

  // Update order status (e.g., after transaction confirmation)
  orders.patch("/:id", zValidator("json", updateOrderSchema), async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const { id } = c.req.param();
    const input = c.req.valid("json");

    // Check if order exists and belongs to user
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        publishRecord: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      }
    });

    if (!existingOrder) {
      return c.json({ error: "not_found" }, 404);
    }

    if (existingOrder.buyerId !== user.id) {
      return c.json({ error: "forbidden" }, 403);
    }

    const updateData: Record<string, unknown> = {};
    if (input.status) updateData.status = input.status;
    if (input.statusMessage !== undefined) updateData.statusMessage = input.statusMessage;
    if (input.txHash) updateData.txHash = input.txHash;

    const record = await prisma.order.update({
      where: { id },
      data: updateData
    });

    return c.json({
      order: {
        id: record.id,
        orderNumber: record.orderNumber,
        status: record.status,
        statusMessage: record.statusMessage,
        txHash: record.txHash,
        updatedAt: record.updatedAt.toISOString()
      }
    });
  });

  // Delete order (only pending orders can be deleted)
  orders.delete("/:id", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "unauthorized" }, 401);

    const { id } = c.req.param();

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        publishRecord: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      }
    });

    if (!existingOrder) {
      return c.json({ error: "not_found" }, 404);
    }

    if (existingOrder.buyerId !== user.id) {
      return c.json({ error: "forbidden" }, 403);
    }

    // Only allow deletion of pending orders
    if (existingOrder.status !== "pending") {
      return c.json({ error: "cannot_delete_non_pending_order" }, 400);
    }

    await prisma.order.delete({ where: { id } });

    return c.json({ ok: true });
  });

  return orders;
}
