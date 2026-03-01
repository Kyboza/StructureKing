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
    let accessToken = req.cookies?.["access_token"];

    // Om access token saknas, försök refresh
    if (!accessToken) {
      const refresh = req.cookies?.["refresh_token"];
      if (refresh) {
        try {
          const r = await fetch("http://localhost:3000/api/refreshAccessToken", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          if (r.ok) {
            // Ny token satt i cookies av backend, läs den igen
            accessToken = req.cookies?.["access_token"];
          } else {
            return res.status(401).json({ error: "Unauthorized, refresh failed" });
          }
        } catch (err) {
          logError(err);
          return res.status(401).json({ error: "Unauthorized, refresh failed" });
        }
      } else {
        return res.status(401).json({ error: "Unauthorized, no token" });
      }
    }

    // Verifiera access token
    const decoded = jwt.verify(accessToken!, env.ACCESS_TOKEN_SECRET) as JwtClaims;

    // Lägg info på req för routes
    req.user = decoded.username;
    req.role = decoded.role;
    req.id = decoded.id;

    next();
  } catch (error: unknown) {
    // Om token expired, försök refresh automatiskt
    if (error instanceof TokenExpiredError) {
      const refresh = req.cookies?.["refresh_token"];
      if (!refresh) return res.status(401).json({ error: "Token expired, no refresh" });

      try {
        const r = await fetch("http://localhost:3000/api/refreshAccessToken", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!r.ok) return res.status(401).json({ error: "Token expired, refresh failed" });

        // Läs nya token
        const newAccessToken = req.cookies?.["access_token"];
        if (!newAccessToken) return res.status(401).json({ error: "Token expired, refresh failed" });

        const decoded = jwt.verify(newAccessToken, env.ACCESS_TOKEN_SECRET) as JwtClaims;
        req.user = decoded.username;
        req.role = decoded.role;
        req.id = decoded.id;

        return next();
      } catch (err) {
        logError(err);
        return res.status(401).json({ error: "Token expired, refresh failed" });
      }
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    logError(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}