import type { NextFunction, Request, Response } from 'express'

export async function verifyAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> {
    const verifiedRole = req.user?.role
    if (verifiedRole !== 'Admin') {
        return res.status(403).json({ error: 'Admin only' })
    }
    next()
}
