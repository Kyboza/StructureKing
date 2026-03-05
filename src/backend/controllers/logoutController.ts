import type { Request, Response } from 'express'

export async function logoutUser(_req: Request, res: Response) {
    res.clearCookie('refresh_token')
    res.clearCookie('access_token')
    return res
        .status(200)
        .json({ success: true, message: 'User logged out successfully' })
}
