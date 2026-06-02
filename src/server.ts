import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth.js";
import { contactRoutes } from "./routes/contacts.js";
import "dotenv/config";

export const app = Fastify({
  logger: true,
});

const start = async () => {
  try {
    await app.register(cors, {
      origin: true,
      credentials: true,
    });

    await app.register(jwt, {
      secret: process.env.JWT_SECRET as string,
    });

    await app.register(cookie);

    // Routes
    await app.register(authRoutes);
    await app.register(contactRoutes);

    // Health check
    app.get("/health", async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });

    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();