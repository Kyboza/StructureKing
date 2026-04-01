import { logError } from '../../utils/logError.js'

import type { NextFunction, Request, Response } from 'express'

export function verifyAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Response | void {
    try {
        if (!req.user) {
            return res
                .status(401)
                .json({ error: 'Unauthorized' })
        }

        if (req.user.role !== 'Admin') {
            return res
                .status(403)
                .json({ error: 'Admin only' })
        }

        return next()
    } catch (error) {
        logError(error)
        return res.status(500).json({ error: 'Server Error' })
    }
}