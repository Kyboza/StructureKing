import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

type Role = 'None' | 'User' | 'Admin'
type AuthRequirement = 'None' | 'User' | 'Admin'

type UseAuthCheckOptions = { require: AuthRequirement }

export type AuthStatus =
    | { authenticated: true; role: Exclude<Role, 'None'>; username: string }
    | { authenticated: false; role: 'None' }
    | null

export function useAuthCheck({ require }: UseAuthCheckOptions): AuthStatus {
    const [status, setStatus] = useState<AuthStatus>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                let res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/frontendRedirect`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ require }),
                        signal,
                    }
                )

                if (res.status === 401) {
                    const refresh = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/refreshAccessToken`,
                        {
                            method: 'POST',
                            credentials: 'include',
                        }
                    )

                    if (refresh.ok) {
                        res = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/frontendRedirect`,
                            {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ require }),
                                signal,
                            }
                        )
                    }
                }

                if (!res.ok) {
                    if (require !== 'None') {
                        setStatus({ authenticated: false, role: 'None' })
                        navigate('/', { replace: true })
                    } else {
                        setStatus({ authenticated: false, role: 'None' })
                    }
                    return
                }

                const data = await res.json()

                if (data.authenticated) {
                    setStatus({
                        authenticated: true,
                        role: data.role,
                        username: data.username,
                    })

                    if (require === 'None') {
                        navigate('/dashboard', { replace: true })
                    }
                } else {
                    setStatus({ authenticated: false, role: 'None' })
                }
            } catch (err: unknown) {
                if ((err as { name?: string }).name === 'AbortError') return

                if (require !== 'None') {
                    setStatus({ authenticated: false, role: 'None' })
                    navigate('/', { replace: true })
                } else {
                    setStatus({ authenticated: false, role: 'None' })
                }
            }
        })()

        return () => controller.abort()
    }, [require, navigate])

    return status
}
