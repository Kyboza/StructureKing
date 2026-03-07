import { useEffect, useState } from 'react'

import Button from '../reusable/Button'

type RoomType = {
    _id: string
    name: string
    type: 'Workshop' | 'Conference'
    capacity: number
}

type BookingFormProps = {
    onSuccess?: () => void
}

const BookingForm = ({ onSuccess }: BookingFormProps) => {
    const [rooms, setRooms] = useState<RoomType[]>([])
    const [selectedRoomId, setSelectedRoomId] = useState<string>('')
    const [timeSlot, setTimeSlot] = useState<string>('')
    const [generalError, setGeneralError] = useState<string>('')
    const [successMsg, setSuccessMsg] = useState<string>('')

    const timeOptions = ['09:00', '09:30', '10:00', '10:30']

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchRooms = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/rooms`,
                    {
                        method: 'GET',
                        signal,
                        credentials: 'include',
                    }
                )
                if (!res.ok) {
                    setGeneralError('Could not fetch rooms')
                    return
                }

                const data = await res.json()
                if (data.success && Array.isArray(data.rooms)) {
                    setRooms(data.rooms)
                    if (data.rooms.length > 0)
                        setSelectedRoomId(data.rooms[0]._id)
                } else {
                    setGeneralError(data.error || 'Could not fetch rooms')
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError')
                    return
                setGeneralError('Server error fetching rooms')
            }
        }

        fetchRooms()
        return () => controller.abort()
    }, [])

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedRoomId) {
            setGeneralError('Please select a room')
            return
        }
        if (!timeSlot) {
            setGeneralError('Please select a time slot')
            return
        }

        setGeneralError('')

        const [hours, minutes] = timeSlot.split(':').map(Number)
        const now = new Date()
        const startTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hours,
            minutes
        )
        const endTime = new Date(startTime.getTime() + 30 * 60 * 1000)

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/bookings`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        roomId: selectedRoomId,
                        startTime: startTime.toISOString(),
                        endTime: endTime.toISOString(),
                    }),
                }
            )

            const data = await res.json()
            if (!data.success) {
                setGeneralError(data.error || 'Booking failed')
                return
            }

            setSuccessMsg(data.message)
            if (onSuccess) onSuccess()
            setTimeout(() => setSuccessMsg(''), 1500)
        } catch {
            setGeneralError('Server error. Please try again later.')
        }
    }

    return (
        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
                <label htmlFor="form-select" className="font-semibold">
                    Select Room:
                </label>
                <select
                    id="form-select"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full rounded-md border p-2"
                >
                    {rooms.map((room) => (
                        <option key={room._id} value={room._id}>
                            {room.name} ({room.type})
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-wrap gap-2">
                {timeOptions.map((slot) => (
                    <label
                        key={slot}
                        className="flex w-1/2 cursor-pointer items-center gap-1 md:w-auto"
                    >
                        <input
                            type="radio"
                            name="timeSlot"
                            value={slot}
                            checked={timeSlot === slot}
                            onChange={() => setTimeSlot(slot)}
                            className="h-5 w-5 accent-black"
                        />
                        <span className="text-letter dark:text-letter-dark text-sm md:text-base">
                            {slot}
                        </span>
                    </label>
                ))}
            </div>
            <div className="flex w-full items-center justify-center">
                {generalError && (
                    <p className="text-error text-xs">{generalError}</p>
                )}
                {successMsg && (
                    <p className="text-success text-xs">{successMsg}</p>
                )}
            </div>

            <Button
                type="submit"
                label="Create Booking"
                title="Create Booking"
            />
        </form>
    )
}

export default BookingForm
