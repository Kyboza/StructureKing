import jwt from "jsonwebtoken";
import { env } from "../../validation/zod.config-server.ts";
import { logError } from "../../utils/logError.ts";
import type { Request, Response, NextFunction } from "express";
import type { JwtClaims } from "../../../../types/express";

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
    const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as JwtClaims;

    // Lägg hela user-objektet på req.user
    req.user = {
      id: decoded.id,        // string
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logError(error)
    return res.status(500).json({ error: "Server Error" });
  }
}