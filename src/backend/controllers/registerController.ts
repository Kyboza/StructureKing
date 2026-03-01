import User from "../database/models/user/user-model.ts";
import bcrypt from "bcrypt";
import { env } from "../validation/zod.config-server.ts";
import { logError } from "../utils/logError.ts";
import { registerSchema } from "../validation/zod-schemas.ts";
import winstonLogger from "../utils/winstonLogger.ts"; // Winston client
import type { Request, Response } from "express";

export async function registerUser(req: Request, res: Response): Promise<Response> {
  try {
    console.log("Nådde Register API")
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      winstonLogger.warn("Invalid registration data"); // loggar anonymiserat
      return res.status(400).json({ error: "Invalid data", success: false });
    }

    const { email, username, password, website } = parsed.data;

    // Honeypot
    if (website) {
      winstonLogger.warn("Honeypot triggered", { status: "honeypot" });
      return res.status(400).json({ error: "Could not register user", success: false });
    }

    const doesUserExist = await User.findOne({ email });
    if (doesUserExist) {
      winstonLogger.warn("Duplicate registration attempt", { status: "duplicate" });
      return res.status(400).json({ error: "Could not register user", success: false });
    }

    const hashedPassword = await bcrypt.hash(password + env.PEPPER_SECRET, 12);

    // Skapar användaren
    const newUser = await User.create({
      email,
      name: username,
      password: hashedPassword,
      // role, createdAt, updatedAt → fylls i automatiskt av default i schemat
    });

    winstonLogger.info("User registered successfully", { userId: newUser._id }); // logga anonymiserat ID

    return res.status(201).json({ message: "User registered successfully", success: true });
  } catch (error) {
    logError(error); // skickar till Sentry
    winstonLogger.error("Server error during registration", { error }); // sparas lokalt i loggfil
    return res.status(500).json({ error: "Server Error", success: false });
  }
}