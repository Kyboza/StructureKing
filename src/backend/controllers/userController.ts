
import User from '../database/models/user/user-model.js'
import { logError } from '../utils/logError.js'
import winstonLogger from '../utils/winstonLogger.js'

import type { Request, Response } from 'express'

export async function getAllUsers(
    _req: Request,
    res: Response
): Promise<Response> {
    try {
        const users = await User.find().select('name role createdAt').lean()
        if (users.length === 0)
            return res
                .status(404)
                .json({ success: false, error: 'Users not found' })
        const normalized = users.map((u) => ({ ...u, _id: u._id.toString() }))
        winstonLogger.info('Fetched all users')
        return res.status(200).json({
            success: true,
            users: normalized,
            message: 'Users returned',
        })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during user get', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}

export async function deleteUser(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        if (!userId)
            return res
                .status(400)
                .json({ success: false, error: 'Invalid user id' })
        const user = await User.findByIdAndDelete(userId)
        winstonLogger.info('User deleted')
        if (!user)
            return res
                .status(404)
                .json({ success: false, error: 'User not found' })
        return res
            .status(200)
            .json({ success: true, message: 'User deleted', userId: user._id })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during user delete', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}
