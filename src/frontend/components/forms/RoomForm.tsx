import { useState } from 'react'

import { roomsSchema } from '../../validation/zod-schemas'
import Button from '../reusable/Button'

import type { RoomsSchemaType } from '../../validation/zod-schemas'

type RoomFrontendDataType = {
    name: string
    capacity: string
    type: 'Workspace' | 'Conference'
    website: string
}

type RoomFormProps = {
    onSuccess?: () => void
}

const RoomForm = ({ onSuccess }: RoomFormProps) => {
    const [formData, setFormData] = useState<RoomFrontendDataType>({
        name: '',
        capacity: '',
        type: 'Workspace',
        website: '',
    })
    const [roomErrors, setRoomErrors] = useState<
        Partial<Record<keyof RoomsSchemaType, string>>
    >({})
    const [generalError, setGeneralError] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        const result = roomsSchema.safeParse(formData)
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof RoomsSchemaType, string>> =
                {}
            for (const err of result.error.issues) {
                const field = err.path[0] as keyof RoomsSchemaType
                fieldErrors[field] = err.message
            }
            setRoomErrors(fieldErrors)
            return
        }

        setRoomErrors({})
        setGeneralError('')

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            })
            const data = await res.json()

            if (!data.success) {
                setGeneralError(data.error || 'Room creation failed')
                return
            }

            setFormData({
                name: '',
                capacity: '',
                type: 'Workspace',
                website: '',
            })
            setSuccessMessage(data.message)

            if (onSuccess) onSuccess()

            setTimeout(() => {
                setSuccessMessage('')
            }, 1500)
        } catch (error) {
            console.error('Error during room creation:', error)
            setGeneralError('Server error. Please try again later.')
        }
    }

    return (
        <form
            className="text-letter dark:text-letter-dark flex h-auto w-full flex-col items-center gap-6"
            onSubmit={handleSubmit}
            noValidate
        >
            <input
                name="name"
                type="name"
                placeholder="Name..."
                autoComplete="off"
                value={formData.name}
                onChange={handleChange}
                required
                className="dark:placeholder:text-letter-dark h-10 w-full rounded-md border p-2 placeholder:text-gray-500 md:h-14"
            />
            {roomErrors.name && (
                <p className="text-error text-xs md:text-sm">
                    {roomErrors.name}
                </p>
            )}

            <input
                name="capacity"
                type="text"
                placeholder="Capacity..."
                autoComplete="off"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="dark:placeholder:text-letter-dark h-10 w-full rounded-md border p-2 placeholder:text-gray-500 md:h-14"
            />
            {roomErrors.capacity && (
                <p className="text-error text-xs md:text-sm">
                    {roomErrors.capacity}
                </p>
            )}

            <div className="flex w-full flex-row items-start gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                    <span className="dark:text-letter-dark text-sm text-gray-500 md:text-base">
                        Workspace
                    </span>
                    <input
                        name="type"
                        type="radio"
                        value="Workspace"
                        checked={formData.type === 'Workspace'}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                type: e.target.value as RoomsSchemaType['type'],
                            }))
                        }
                        className="h-5 w-5 cursor-pointer accent-black"
                    />
                </label>

                <label className="flex cursor-pointer items-center gap-2">
                    <span className="dark:text-letter-dark text-sm text-gray-500 md:text-base">
                        Conference
                    </span>
                    <input
                        name="type"
                        type="radio"
                        value="Conference"
                        checked={formData.type === 'Conference'}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                type: e.target.value as RoomsSchemaType['type'],
                            }))
                        }
                        className="h-5 w-5 cursor-pointer accent-black"
                    />
                </label>
            </div>
            {roomErrors.type && (
                <p className="text-error text-xs md:text-sm">
                    {roomErrors.type}
                </p>
            )}

            <input
                name="website"
                type="text"
                value={formData.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-2455 m-0 h-px w-px border-0 p-0"
            />

            {generalError && (
                <p className="text-error text-xs md:text-sm">{generalError}</p>
            )}
            {successMessage && (
                <p className="text-success text-xs md:text-sm">
                    {successMessage}
                </p>
            )}

            <Button type="submit" label="Create Room" title="Create Room" />
        </form>
    )
}

export default RoomForm
