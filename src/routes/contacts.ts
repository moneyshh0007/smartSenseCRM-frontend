import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().optional(),
  location: z.string().optional(),
  source: z.string().optional(),
  companyId: z.string().optional(),
});

const updateContactSchema = createContactSchema.partial();

async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}

export async function contactRoutes(app: FastifyInstance) {
  // GET /contacts — list all contacts in workspace
  app.get("/contacts", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as any;

    const contacts = await prisma.contact.findMany({
      where: { workspaceId: payload.workspaceId },
      include: {
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return reply.send({ contacts, total: contacts.length });
  });

  // GET /contacts/:id — get single contact
  app.get("/contacts/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as any;
    const { id } = request.params as { id: string };

    const contact = await prisma.contact.findFirst({
      where: { id, workspaceId: payload.workspaceId },
      include: {
        company: { select: { id: true, name: true } },
        deals: {
          include: {
            deal: { select: { id: true, name: true, stage: true, amount: true } },
          },
        },
        tasks: { orderBy: { createdAt: "desc" }, take: 5 },
        notes: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!contact) return reply.status(404).send({ error: "Contact not found" });

    return reply.send({ contact });
  });

  // POST /contacts — create contact
  app.post("/contacts", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as any;

    const body = createContactSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const contact = await prisma.contact.create({
      data: {
        ...body.data,
        workspaceId: payload.workspaceId,
        ownerId: payload.userId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        actorType: "user",
        action: "contact.created",
        objectType: "Contact",
        objectId: contact.id,
        ip: request.ip,
      },
    });

    return reply.status(201).send({ contact });
  });

  // PATCH /contacts/:id — update contact
  app.patch("/contacts/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as any;
    const { id } = request.params as { id: string };

    const body = updateContactSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: body.error.flatten() });
    }

    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId: payload.workspaceId },
    });
    if (!existing) return reply.status(404).send({ error: "Contact not found" });

    const contact = await prisma.contact.update({
      where: { id },
      data: body.data,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        actorType: "user",
        action: "contact.updated",
        objectType: "Contact",
        objectId: contact.id,
        diff: body.data as any,
        ip: request.ip,
      },
    });

    return reply.send({ contact });
  });

  // DELETE /contacts/:id
  app.delete("/contacts/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as any;
    const { id } = request.params as { id: string };

    const existing = await prisma.contact.findFirst({
      where: { id, workspaceId: payload.workspaceId },
    });
    if (!existing) return reply.status(404).send({ error: "Contact not found" });

    await prisma.contact.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        workspaceId: payload.workspaceId,
        actorId: payload.userId,
        actorType: "user",
        action: "contact.deleted",
        objectType: "Contact",
        objectId: id,
        ip: request.ip,
      },
    });

    return reply.send({ success: true });
  });
}