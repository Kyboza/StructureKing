import { useEffect, useRef } from 'react'

import { io as socketClient, Socket } from 'socket.io-client'
import { toast } from 'sonner'

export default function BookingNotifications() {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = socketClient(
                `${import.meta.env.VITE_API_URL}`,
                {
                    withCredentials: true,
                    transports: ['polling', 'websocket'],
                    path: '/socket.io/',
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                }
            )
        }

        const socket = socketRef.current

        const handlePostBooking = (data: { message: string }) => {
            toast.success(data.message)
        }

        const handleEditBooking = (data: { message: string }) => {
            toast.info(data.message)
        }

        const handleDeleteBooking = (data: { message: string }) => {
            toast.error(data.message, {
                classNames: {
                    actionButton: 'bg-primary',
                    toast: 'bg-primary',
                },
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
