import type { Request, Response, NextFunction } from "express";


export async function noJWTAllowed(req: Request, res: Response, next: NextFunction): Promise<Response | void>{
    const accessToken = req.cookies?.["access_token"];
    const refreshToken = req.cookies?.["refresh_token"];
    if(accessToken || refreshToken){
        return res.status(403).json({error: "JWT not allowed"});
    }
    next();
}