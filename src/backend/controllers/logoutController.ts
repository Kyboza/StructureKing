import type { Request, Response } from 'express'

export async function logoutUser(_req: Request, res: Response) {
    res.clearCookie('refresh_token', {secure: true, httpOnly: true, sameSite: 'none' })
    res.clearCookie('access_token', {secure: true, httpOnly: true, sameSite: 'none' })
    return res
        .status(200)
        .json({ success: true, message: 'User logged out successfully' })
}
