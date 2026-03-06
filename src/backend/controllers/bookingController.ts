import { Types } from 'mongoose'

import { redis } from '../clients/upstash-redis-client.js'
import Booking from '../database/models/booking/booking-model.js'
import { io } from '../server.js'
import { logError } from '../utils/logError.js'
import winstonLogger from '../utils/winstonLogger.js'

import type { Request, Response } from 'express'

export async function getUserBookings(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        if (!req.user?.id)
            return res
                .status(400)
                .json({ success: false, error: 'Missing user id' })

        const userId = new Types.ObjectId(req.user.id)
        const bookings = await Booking.find({ userId }).lean()
        const normalized = bookings.map((b) => ({
            ...b,
            _id: b._id.toString(),
        }))

        return res.status(200).json({
            success: true,
            bookings: normalized,
        })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during getUserBookings', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}

export async function getAllBookings(
    _req: Request,
    res: Response
): Promise<Response> {
    const cacheKey = 'getAllBookings'

    try {
        let cachedData: string | null = null
        try {
            cachedData = await redis.get(cacheKey)
        } catch (error) {
            logError(error)
        }

        if (cachedData) {
            try {
                const parsed =
                    typeof cachedData === 'string'
                        ? JSON.parse(cachedData)
                        : cachedData
                return res.status(200).json({ success: true, bookings: parsed })
            } catch (error) {
                logError(error)
            }
        }

        const bookings = await Booking.find()
            .populate('userId', 'name')
            .populate('roomId', 'name type')
            .sort({ createdAt: -1 })
            .lean()

        const formatted = bookings
            .filter((b) => b.roomId && b.userId)
            .map((b) => ({
                _id: b._id.toString(),
                roomId: b.roomId._id.toString(),
                userId: b.userId._id.toString(),
                roomType: b.roomId.type,
                username: b.userId.name,
                startTime: b.startTime,
                endTime: b.endTime,
            }))

        ;(async () => {
            try {
                const jsonData = JSON.stringify(formatted)
                await redis.set(cacheKey, jsonData, { ex: 60 * 15 })
            } catch (error) {
                logError(error)
            }
        })()

        return res.status(200).json({ success: true, bookings: formatted })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error under getAllBookings', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}

export async function postBookings(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        if (!req.user?.id)
            return res
                .status(400)
                .json({ success: false, error: 'Missing user id' })

        const userId = new Types.ObjectId(req.user.id)
        const roomId = req.body.roomId

        if (!Types.ObjectId.isValid(roomId)) {
            return res
                .status(400)
                .json({ success: false, error: 'Invalid room id' })
        }

        const roomObjectId = new Types.ObjectId(roomId)
        const start = new Date(req.body.startTime)
        const end = new Date(req.body.endTime)

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res
                .status(400)
                .json({ success: false, error: 'Invalid date format' })
        }

        if (start >= end) {
            return res.status(400).json({
                success: false,
                error: 'Start time must be before end time',
            })
        }

        const overlapping = await Booking.findOne({
            roomId: roomObjectId,
            startTime: { $lt: end },
            endTime: { $gt: start },
        })

        if (overlapping) {
            winstonLogger.warn('Attempted overlapping booking', {
                roomId: roomObjectId.toString(),
                start,
                end,
            })
            return res.status(400).json({
                success: false,
                error: 'Room already booked for this time',
            })
        }

        const createBooking = await Booking.create({
            userId,
            roomId: roomObjectId,
            startTime: start,
            endTime: end,
        })
        const newBooking = await Booking.findById(createBooking._id)
            .populate('roomId', 'name')
            .lean()
        const roomName = newBooking?.roomId?.name ?? 'Unknown'

        winstonLogger.info('Booking created for room', {
            bookingId: createBooking._id.toString(),
            roomName,
            start,
            end,
            userId: userId.toString(),
        })

        io.emit('postBooking', {
            message: `A new booking was created for room: ${roomName}`,
        })
        await redis.del('getAllBookings')

        return res.status(201).json({
            success: true,
            message: `Booking created successfully for room: ${roomName}`,
            bookingId: createBooking._id.toString(),
        })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during postBookings', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}

export async function putBookings(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const bookingId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        if (!Types.ObjectId.isValid(bookingId))
            return res
                .status(400)
                .json({ success: false, error: 'Invalid booking id' })

        const booking = await Booking.findById(bookingId)
        if (!booking)
            return res
                .status(404)
                .json({ success: false, error: 'Booking not found' })

        const start = new Date(req.body.startTime)
        const end = new Date(req.body.endTime)
        if (start >= end)
            return res.status(400).json({
                success: false,
                error: 'Start time must be before end time',
            })

        const roomObjectId = new Types.ObjectId(booking.roomId)
        const overlapping = await Booking.findOne({
            roomId: roomObjectId,
            _id: { $ne: booking._id },
            startTime: { $lt: end },
            endTime: { $gt: start },
        })

        if (overlapping)
            return res.status(400).json({
                success: false,
                error: 'Room already booked for this time',
            })

        booking.startTime = start
        booking.endTime = end
        await booking.save()

        const updatedBooking = await Booking.findById(bookingId)
            .populate('roomId', 'name')
            .lean()
        winstonLogger.info('Booking time updated for room:', {
            roomName: updatedBooking.roomId.name,
        })
        io.emit('editBooking', {
            message: `A booking time was changed for room: ${updatedBooking.roomId.name}`,
        })
        await redis.del('getAllBookings')
        return res.status(200).json({ success: true, booking })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during putBookings', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}

export async function deleteBookings(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const requestingUserId = req.user?.id
        if (!requestingUserId)
            return res
                .status(401)
                .json({ success: false, error: 'Unauthorized' })

        const bookingId = Array.isArray(req.params.id)
            ? req.params.id[0]
            : req.params.id
        if (!Types.ObjectId.isValid(bookingId))
            return res
                .status(400)
                .json({ success: false, error: 'Invalid booking id' })

        const booking = await Booking.findById(bookingId).populate(
            'roomId',
            'name'
        )
        if (!booking)
            return res
                .status(404)
                .json({ success: false, error: 'Booking not found' })
        if (booking.userId.toString() !== requestingUserId)
            return res.status(403).json({
                success: false,
                error: 'You are not allowed to delete this booking',
            })

        await booking.deleteOne()
        winstonLogger.info('Booking deleted for room:', {
            roomName: booking.roomId.name,
        })
        io.emit('deleteBooking', {
            message: `A booking was deleted for room: ${booking.roomId.name}`,
        })
        await redis.del('getAllBookings')
        return res
            .status(200)
            .json({ success: true, message: 'Booking deleted' })
    } catch (error) {
        logError(error)
        winstonLogger.error('Server error during deleteBookings', { error })
        return res.status(500).json({ success: false, error: 'Server Error' })
    }
}
