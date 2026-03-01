// TypeScript (Express)
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../validation/zod.config-server.ts";
import { logError } from "../utils/logError.ts";

type Role = "user" | "admin";
type RequiredMode = "none" | Role;

interface AccessClaims {
  role: Role;
  iat?: number;
  exp?: number;
}

export async function frontendRedirect(req: Request, res: Response): Promise<Response> {
  console.log("Nådde")
  const required = (req.body?.require as RequiredMode | undefined) ?? "none";
  console.log(required)
  const token = req.cookies?.["access_token"];

  // Ingen token: behandla som utloggad
  if (!token) {
    if (required === "none") {
      return res.status(200).json({ authenticated: false, role: "none", success: true });
    }
    return res.status(401).json({ authenticated: false, role: "none", success: false, reason: "unauthorized" });
  }

  let claims: AccessClaims;
  try {
    claims = jwt.verify(token, env.ACCESS_TOKEN_SECRET as string) as AccessClaims;
  } catch (error) {
    logError(error)
    if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
      if (required === "none") {
        return res.status(200).json({ authenticated: false, role: "none", success: true });
      }
      return res.status(401).json({ authenticated: false, role: "none", success: false, reason: "expired" });
    }
    return res.status(500).json({ authenticated: false, role: "none", success: false });
  }

  // Matcha krav
  if (required === "none") {
    return res.status(200).json({ authenticated: true, role: claims.role, success: true });
  }
  if (required === "admin" && claims.role === "admin") {
    return res.status(200).json({ authenticated: true, role: "admin", success: true });
  }
  if (required === "user") {
    // “user” = alla inloggade (user eller admin)
    return res.status(200).json({ authenticated: true, role: claims.role, success: true });
  }

  // Inloggad men fel roll
  return res.status(403).json({ authenticated: true, role: claims.role, success: false, reason: "forbidden" });
}