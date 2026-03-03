import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../validation/zod.config-server.ts";
import { logError } from "../utils/logError.ts";

type Role = "User" | "Admin";
type RequiredMode = "None" | Role;

interface AccessClaims {
  role: Role;
  username: string;
  iat?: number;
  exp?: number;
}

export async function frontendRedirect(
  req: Request,
  res: Response
): Promise<Response> {
  const required = (req.body?.require as RequiredMode | undefined) ?? "None";
  const token = req.cookies?.["access_token"];

  // Ingen token
  if (!token) {
    if (required === "None") {
      return res.status(200).json({
        authenticated: false,
        role: "None",
        success: true,
      });
    }

    return res.status(401).json({
      authenticated: false,
      role: "None",
      success: false,
      reason: "unauthorized",
    });
  }

  let claims: AccessClaims;

  try {
    claims = jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET as string
    ) as AccessClaims;
  } catch (error) {
    logError(error);

    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      if (required === "None") {
        return res.status(200).json({
          authenticated: false,
          role: "None",
          success: true,
        });
      }

      return res.status(401).json({
        authenticated: false,
        role: "None",
        success: false,
        reason: "expired",
      });
    }

    return res.status(500).json({
      authenticated: false,
      role: "None",
      success: false,
    });
  }

  // =============================
  // AUTHENTICATED USER
  // =============================

  // Inget krav → bara returnera status
 if (required === "None") {
  return res.status(200).json({ 
    authenticated: true, 
    role: claims.role, 
    username: claims.username,  // lägg till username
    success: true 
  });
}

  // Admin krävs
  if (required === "Admin") {
    if (claims.role === "Admin") {
      return res.status(200).json({
        authenticated: true,
        role: "Admin",
        username: claims.username,
        success: true,
      });
    }

    return res.status(403).json({
      authenticated: true,
      role: claims.role,
      username: claims.username,
      success: false,
      reason: "forbidden",
    });
  }

  // User krävs (alla inloggade)
  if (required === "User") {
    return res.status(200).json({
      authenticated: true,
      role: claims.role,
      username: claims.username,
      success: true,
    });
  }

  return res.status(500).json({
    authenticated: false,
    role: "None",
    success: false,
  });
}