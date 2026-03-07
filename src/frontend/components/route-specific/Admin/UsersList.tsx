import { useEffect, useState } from 'react'

import { ArrowDownIcon } from '../../icons/lucide-arrow-down'
import { ArrowUpIcon } from '../../icons/lucide-arrow-up'

type UserFrontendType = {
    _id: string
    name: string
    role: 'User' | 'Admin'
    createdAt: string
}

const UsersList = () => {
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [successMsg, setSuccessMsg] = useState<string>('')
    const [users, setUsers] = useState<UserFrontendType[]>([])
    const [viewBookings, setViewBookings] = useState<boolean>(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal
        const fetchUsers = async (): Promise<void> => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/users`,
                    {
                        method: 'GET',
                        signal,
                        credentials: 'include',
                    }
                )

                if (!res.ok) {
                    setErrorMsg('Could not reach server')
                    setUsers([])
                    return
                }

                const data = await res.json()

                if (data.success) {
                    setUsers(data.users)
                    setErrorMsg('')
                } else {
                    setUsers([])
                    setErrorMsg(data.error ?? 'Could not fetch users')
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError')
                    return
                setErrorMsg('Could not fetch users')
                setUsers([])
            }
        }
        fetchUsers()
        return () => controller.abort()
    }, [])

    const handleDeleteUser = async (userId: string) => {
        if (!userId) return
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
                {
                    method: 'DELETE',
                    credentials: 'include',
                }
            )

            if (!res.ok) {
                setErrorMsg('Failed to delete user')
                return
            }

            const data = await res.json()

            if (data.success) {
                setErrorMsg('')
                setUsers((prev) => prev.filter((u) => u._id !== userId))
                setSuccessMsg(data.message)
                setTimeout(() => {
                    setSuccessMsg('')
                }, 1000)
            } else {
                setErrorMsg(data.error || 'Failed to delete user')
            }
        } catch {
            setErrorMsg('Server Error')
        }
    }

    return (
        <div className="flex w-full flex-col items-center justify-center">
            {!errorMsg && users.length > 0 && (
                <ul className="flex h-auto w-full flex-col items-center justify-center divide-y divide-gray-300 dark:divide-gray-700">
                    {users.map((user) => (
                        <li
                            className="flex h-auto w-full flex-col items-center justify-evenly gap-4 p-4 md:flex-row"
                            key={user._id}
                        >
                            <div className="flex w-full flex-row items-center justify-evenly gap-10 md:w-1/2 md:gap-4">
                                {!viewBookings ? (
                                    <button
                                        onClick={() =>
                                            setViewBookings((prev) => !prev)
                                        }
                                        className="mb-1 cursor-pointer [&_svg]:size-5 md:[&_svg]:size-6"
                                    >
                                        <ArrowDownIcon />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            setViewBookings((prev) => !prev)
                                        }
                                        className="mb-1 cursor-pointer [&_svg]:size-5 md:[&_svg]:size-6"
                                    >
                                        <ArrowUpIcon />
                                    </button>
                                )}
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    Name:{' '}
                                    <span className="font-semibold">
                                        {user.name}
                                    </span>
                                </p>

                                <div className="flex items-center gap-2">
                                    <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                        Role:{' '}
                                        <span className="font-semibold">
                                            {user.role}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex w-full flex-row items-center justify-evenly gap-10 md:w-1/2 md:gap-4">
                                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                                    Created:{' '}
                                    <span className="font-semibold">
                                        {new Date(user.createdAt)
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

                                <button
                                    onClick={() => handleDeleteUser(user._id)}
                                    type="button"
                                    aria-label={`Delete user: ${user.name}`}
                                    className="text-error cursor-pointer rounded-md border border-black p-2 text-xs sm:text-sm md:text-base dark:border-white"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!errorMsg && users.length === 0 && (
                <p className="text-letter dark:text-letter-dark text-xs font-semibold md:text-sm">
                    No Users Exist
                </p>
            )}

            {errorMsg && users.length < 1 && (
                <p className="text-error text-xs md:text-sm">{errorMsg}</p>
            )}

            {successMsg && (
                <p className="text-success text-xs md:text-sm">{successMsg}</p>
            )}
        </div>
    )
}

export default UsersList
