import { useEffect, useState } from 'react'

type ReturnedBookingsType = {
    _id: string
    roomId: string
    userId: string
    roomType: 'Workshop' | 'Conference'
    username: string
    startTime: Date
    endTime: Date
}

type BookingsListProps = {
    refreshKey: number
    currentUser: string
}

const BookingsList = ({ refreshKey, currentUser }: BookingsListProps) => {
    const [bookings, setBookings] = useState<ReturnedBookingsType[]>([])
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [successMsg, setSuccessMsg] = useState<string>('')

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchBookings = async (): Promise<void> => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/bookings`,
                    {
                        method: 'GET',
                        signal,
                        credentials: 'include',
                    }
                )
                if (!res.ok) {
                    setErrorMsg('Could not fetch bookings')
                    setBookings([])
                    return
                }

                const data = await res.json()

                if (data.success) {
                    const bookingsWithDates: ReturnedBookingsType[] =
                        Array.isArray(data.bookings) ? data.bookings : []

                    setBookings(bookingsWithDates)
                    setErrorMsg('')
                } else {
                    setBookings([])
                    setErrorMsg(data.error ?? 'Could not fetch bookings')
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError')
                    setErrorMsg('Server error fetching bookings')
                setBookings([])
            }
        }

        fetchBookings()
        return () => controller.abort()
    }, [refreshKey])

    if (!currentUser) return null

    const handleDeleteBooking = async (bookingId: string): Promise<void> => {
        if (!bookingId) return

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )

            if (!res.ok) {
                setErrorMsg('Could not delete booking')
                return
            }

            const data = await res.json()

            if (data.success) {
                setBookings((prev) => prev.filter((b) => b._id !== bookingId))
                setSuccessMsg(data.message)
                setErrorMsg('')
                setTimeout(() => setSuccessMsg(''), 1000)
            } else {
                setErrorMsg(data.error ?? 'Delete failed')
            }
        } catch {
            setErrorMsg('Server Error')
        }
    }

    return (
        <div className="flex w-full flex-col items-center justify-center">
            {!errorMsg && bookings.length > 0 && (
                <ul className="flex w-full flex-col items-center justify-center divide-y divide-gray-300 dark:divide-gray-700">
                    {bookings.map((booking) => (
                        <li
                            key={booking._id}
                            className="flex w-full flex-col items-start justify-between gap-2 p-4 md:flex-row md:items-center md:gap-4"
                        >
                            <div className="flex w-full flex-row gap-2 md:w-1/2">
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    Type:{' '}
                                    <span className="font-semibold">
                                        {booking.roomType}
                                    </span>
                                </p>
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    By:{' '}
                                    <span className="font-semibold">
                                        {booking.username}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-2 flex w-full flex-row items-center justify-between gap-2 md:mt-0 md:w-1/2">
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    Start:{' '}
                                    <span className="font-semibold">
                                        {new Date(booking.startTime)
                                            .toLocaleString('sv-SE', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                            })
                                            .replace(',', '')}
                                    </span>
                                </p>

                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    End:{' '}
                                    <span className="font-semibold">
                                        {new Date(booking.endTime)
                                            .toLocaleString('sv-SE', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                            })
                                            .replace(',', '')}
                                    </span>
                                </p>

                                {currentUser === booking.username && (
                                    <button
                                        onClick={() =>
                                            handleDeleteBooking(booking._id)
                                        }
                                        type="button"
                                        aria-label="Delete booking"
                                        className="text-error cursor-pointer rounded-md border border-black p-2 text-xs sm:text-sm md:text-base dark:border-white"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!errorMsg && bookings.length === 0 && (
                <p className="text-letter dark:text-letter-dark text-xs font-semibold md:text-sm">
                    No Bookings Created
                </p>
            )}

            {errorMsg && bookings.length < 1 && (
                <p className="text-error text-xs md:text-sm">{errorMsg}</p>
            )}

            {successMsg && (
                <p className="text-success text-xs md:text-sm">{successMsg}</p>
            )}
        </div>
    )
}

export default BookingsList
