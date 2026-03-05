import { useEffect, useState } from 'react'

type ReturnedRoomsType = {
    _id: string
    name: string
    capacity: number
    type: 'Workshop' | 'Conference'
}

const RoomsList = ({ refreshKey }: { refreshKey: number }) => {
    const [rooms, setRooms] = useState<ReturnedRoomsType[]>([])
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [successMsg, setSuccessMsg] = useState<string>('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [draftCapacity, setDraftCapacity] = useState<number | ''>('')

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        const fetchRooms = async (): Promise<void> => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
                    method: 'GET',
                    signal,
                    credentials: 'include',
                })

                if (!res.ok) {
                    setErrorMsg('Could not get users')
                    setRooms([])
                    return
                }

                const data = await res.json()
                if (data.success) {
                    setRooms(Array.isArray(data.rooms) ? data.rooms : [])
                    setErrorMsg('')
                } else {
                    setRooms([])
                    setErrorMsg(data.error ?? 'Could not fetch Rooms')
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError')
                    return
                setErrorMsg('Could not fetch Rooms')
                setRooms([])
            }
        }

        fetchRooms()
        return () => controller.abort()
    }, [refreshKey])

    const handleDeleteRoom = async (roomId: string): Promise<void> => {
        if (!roomId) return
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )

            if (!res.ok) {
                setErrorMsg('Could not delete room')
                return
            }

            const data = await res
                .json()
                .catch(() => ({ success: false, error: 'Delete failed' }))
            if (data.success) {
                setRooms((prev) => prev.filter((r) => r._id !== roomId))
                setErrorMsg('')
                setSuccessMsg(data.message)
                setTimeout(() => {
                    setSuccessMsg('')
                }, 1000)
            } else {
                setErrorMsg(data.error ?? 'Delete failed')
            }
        } catch {
            setErrorMsg('Server Error')
        }
    }

    const startEdit = (roomId: string, current: number): void => {
        setEditingId(roomId)
        setDraftCapacity(current)
    }

    const cancelEdit = (): void => {
        setEditingId(null)
        setDraftCapacity('')
    }

    const saveCapacity = async (roomId: string): Promise<void> => {
        if (draftCapacity === '' || Number.isNaN(Number(draftCapacity))) return

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/rooms/${roomId}`,
                {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ capacity: Number(draftCapacity) }),
                }
            )

            if (!res.ok) {
                setErrorMsg('Update failed')
                return
            }

            const data = await res.json()
            if (data.success && typeof data.roomCapacity === 'number') {
                const nextCapacity: number = data.roomCapacity
                setRooms((prev) =>
                    prev.map((r) =>
                        r._id === roomId ? { ...r, capacity: nextCapacity } : r
                    )
                )
                setEditingId(null)
                setDraftCapacity('')
                setErrorMsg('')
                setSuccessMsg(data.message)
                setTimeout(() => {
                    setSuccessMsg('')
                }, 1000)
            } else {
                setErrorMsg(data.error || 'Update failed')
            }
        } catch {
            setErrorMsg('Server Error')
        }
    }

    const handleCapacityKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        roomId: string
    ) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            cancelEdit()
        } else if (e.key === 'Enter') {
            e.preventDefault()
            saveCapacity(roomId)
        }
    }

    return (
        <div className="flex w-full flex-col items-center justify-center">
            {!errorMsg && rooms.length > 0 && (
                <ul className="flex h-auto w-full flex-col items-center justify-center divide-y divide-gray-300 dark:divide-gray-700">
                    {rooms.map((room) => (
                        <li
                            className="flex h-auto w-full flex-col items-center justify-evenly gap-4 p-4 md:flex-row"
                            key={room._id}
                        >
                            <div className="flex w-full flex-row items-center justify-evenly gap-10 md:w-1/2 md:gap-4">
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    Name:{' '}
                                    <span className="font-semibold">
                                        {room.name}
                                    </span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                        Capacity:
                                    </p>

                                    {editingId === room._id ? (
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={draftCapacity}
                                            onChange={(e) =>
                                                setDraftCapacity(
                                                    e.target.value === ''
                                                        ? ''
                                                        : Number(e.target.value)
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleCapacityKeyDown(
                                                    e,
                                                    room._id
                                                )
                                            }
                                            className="no-spinner h-6 w-6 rounded-md border p-1 text-center text-sm md:h-10 md:w-10"
                                            autoFocus
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            aria-label={`Edit capacity for room: ${room.name}`}
                                            className="flex h-6 w-6 items-center justify-center rounded-md border text-center font-semibold md:h-10 md:w-10"
                                            onClick={() =>
                                                startEdit(
                                                    room._id,
                                                    room.capacity
                                                )
                                            }
                                            title="Edit capacity"
                                        >
                                            <span className="text-letter dark:text-letter-dark text-xs sm:text-sm">
                                                {room.capacity}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex w-full flex-row items-center justify-evenly gap-10 md:w-1/2 md:gap-4">
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    Type:{' '}
                                    <span className="font-semibold">
                                        {room.type}
                                    </span>
                                </p>

                                <button
                                    onClick={() => handleDeleteRoom(room._id)}
                                    type="button"
                                    aria-label={`Delete user: ${room.name}`}
                                    className="text-error cursor-pointer rounded-md border border-black p-2 text-xs sm:text-sm md:text-base dark:border-white"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!errorMsg && rooms.length === 0 && (
                <p className="text-letter dark:text-letter-dark text-xs font-semibold md:text-sm">
                    No Rooms Created
                </p>
            )}

            {errorMsg && rooms.length < 1 && (
                <p className="text-error text-xs md:text-sm">{errorMsg}</p>
            )}

            {successMsg && (
                <p className="text-success text-xs md:text-sm">{successMsg}</p>
            )}
        </div>
    )
}

export default RoomsList
