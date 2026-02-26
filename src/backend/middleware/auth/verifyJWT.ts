
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { env } from "../../validation/zod.config-server.ts";
import { logError } from "../../utils/logError.ts";
import type { Request, Response, NextFunction } from "express";
import type { ObjectId } from "mongoose";

export interface JwtClaims {
  username: string;
  id: ObjectId;
  role: "User" | "Admin";
  iat?: number;
  exp?: number;
}

export async function verifyJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const accessToken = req.cookies?.["access_token"];
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as JwtClaims;

  
    req.user = decoded.username;
    req.role = decoded.role;
    req.id = decoded.id

    next();
  } catch (error: unknown) {
    // Särskilj JWT-fel
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    logError(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}