import { useState } from 'react'

import { registerSchema } from '../../validation/zod-schemas'
import { EyeIcon } from '../icons/lucide-eye'
import { EyeOffIcon } from '../icons/lucide-eye-off'
import Button from '../reusable/Button'

import type { RegisterSchemaType } from '../../validation/zod-schemas'

const RegisterForm = ({
    onRegisterSuccess,
}: {
    onRegisterSuccess?: () => void
}) => {
    const [registerFormData, setRegisterFormData] =
        useState<RegisterSchemaType>({
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            website: '',
        })
    const [registerErrors, setRegisterErrors] = useState<
        Partial<Record<keyof RegisterSchemaType, string>>
    >({})
    const [generalRegisterError, setGeneralRegisterError] = useState<string>('')
    const [registerSuccessMessage, setRegisterSuccessMessage] =
        useState<string>('')
    const [passwordBool, setPasswordBool] = useState<boolean>(true)
    const [confirmPasswordBool, setConfirmPasswordBool] =
        useState<boolean>(true)

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setRegisterFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleRegisterSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>
    ) => {
        e.preventDefault()

        const result = registerSchema.safeParse(registerFormData)
        if (!result.success) {
            const fieldErrors: Partial<
                Record<keyof RegisterSchemaType, string>
            > = {}
            for (const err of result.error.issues) {
                const field = err.path[0] as keyof RegisterSchemaType
                fieldErrors[field] = err.message
            }
            setRegisterErrors(fieldErrors)
            return
        }

        setRegisterErrors({})
        setGeneralRegisterError('')

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/register`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(registerFormData),
                }
            )

            const data = await res.json()

            if (!data.success) {
                setGeneralRegisterError(data.error || 'Registration failed')
                return
            }

            setRegisterFormData({
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
                website: '',
            })
            setRegisterSuccessMessage(data.message)

            const success = true
            setTimeout(() => {
                if (success && onRegisterSuccess) {
                    onRegisterSuccess()
                }
            }, 1500)
        } catch {
            setGeneralRegisterError('Server error. Please try again later.')
        }
    }

    return (
        <>
            <div className="flex w-full items-center justify-center">
                <h1 className="mt-4 text-2xl font-bold italic md:text-4xl">
                    Register Form
                </h1>
            </div>

            <form
                className="text-letter dark:text-letter-dark flex h-auto w-full flex-col items-center gap-6"
                onSubmit={handleRegisterSubmit}
                noValidate
            >
                <input
                    name="email"
                    type="email"
                    placeholder="Email..."
                    autoComplete="off"
                    value={registerFormData.email}
                    onChange={handleRegisterChange}
                    required
                    className="dark:placeholder:text-letter-dark h-10 w-full rounded-md border p-2 placeholder:text-gray-500 md:h-14"
                />
                {registerErrors.email && (
                    <p className="text-error text-xs md:text-sm">
                        {registerErrors.email}
                    </p>
                )}

                <input
                    name="username"
                    type="text"
                    placeholder="Username..."
                    autoComplete="off"
                    value={registerFormData.username}
                    onChange={handleRegisterChange}
                    required
                    className="dark:placeholder:text-letter-dark h-10 w-full rounded-md border p-2 placeholder:text-gray-500 md:h-14"
                />
                {registerErrors.username && (
                    <p className="text-error text-xs md:text-sm">
                        {registerErrors.username}
                    </p>
                )}

                <div className="relative w-full">
                    <input
                        name="password"
                        type={`${passwordBool ? 'password' : 'text'}`}
                        placeholder="Password..."
                        autoComplete="off"
                        value={registerFormData.password}
                        onChange={handleRegisterChange}
                        required
                        className="dark:placeholder:text-letter-dark h-10 w-full rounded-md border p-2 pr-10 placeholder:text-gray-500 md:h-14"
                    />
                    <button
                        type="button"
                        aria-label={
                            passwordBool ? 'Hide password' : 'Show password'
                        }
                        onClick={() => setPasswordBool((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
                    >
                        {passwordBool ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                </div>
                {registerErrors.password && (
                    <p className="text-error text-xs md:text-sm">
                        {registerErrors.password}
                    </p>
                )}

                <div className="relative w-full">
                    <input
                        name="confirmPassword"
                        type={`${confirmPasswordBool ? 'password' : 'text'}`}
                        placeholder="Confirm Password..."
                        autoComplete="off"
                        value={registerFormData.confirmPassword}
                        onChange={handleRegisterChange}
                        required
                        className="dark:placeholder:text-letter-dark h-10 w-full rounded-md border p-2 pr-10 placeholder:text-gray-500 md:h-14"
                    />
                    <button
                        type="button"
                        aria-label={
                            confirmPasswordBool
                                ? 'Hide confirmedPassword'
                                : 'Show confirmedPassword'
                        }
                        onClick={() => setConfirmPasswordBool((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
                    >
                        {confirmPasswordBool ? <EyeIcon /> : <EyeOffIcon />}
                    </button>
                </div>
                {registerErrors.confirmPassword && (
                    <p className="text-error text-xs md:text-sm">
                        {registerErrors.confirmPassword}
                    </p>
                )}

                <input
                    name="website"
                    type="text"
                    value={registerFormData.website}
                    onChange={handleRegisterChange}
                    tabIndex={-1}
                    autoComplete="off"
                    className="absolute left-2455 m-0 h-px w-px border-0 p-0"
                />

                {generalRegisterError && (
                    <p className="text-error text-xs md:text-sm">
                        {generalRegisterError}
                    </p>
                )}
                {registerSuccessMessage && (
                    <p className="text-success text-xs md:text-sm">
                        {registerSuccessMessage}
                    </p>
                )}

                <Button type="submit" label="Register" title="Register" />
            </form>
        </>
    )
}

export default RegisterForm
