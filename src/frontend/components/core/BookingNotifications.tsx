import { useEffect } from 'react'

import { io as socketClient } from 'socket.io-client'
import { toast } from 'sonner'

const socket = socketClient(`${import.meta.env.VITE_API_URL}`)

export default function BookingNotifications() {
    useEffect(() => {
        const handlePostBooking = (data: { message: string }) => {
            toast(`${data.message}`)
        }

        const handleEditBooking = (data: { message: string }) => {
            toast(`${data.message}`)
        }

        const handleDeleteBooking = (data: { message: string }) => {
            toast(`${data.message}`, {
                classNames: { actionButton: 'bg-primary', toast: 'bg-primary' },
            })
        }

        socket.on('postBooking', handlePostBooking)
        socket.on('editBooking', handleEditBooking)
        socket.on('deleteBooking', handleDeleteBooking)

        return () => {
            socket.off('postBooking', handlePostBooking)
            socket.off('editBooking', handleEditBooking)
            socket.off('deleteBooking', handleDeleteBooking)
        }
    }, [])

    return null
}
