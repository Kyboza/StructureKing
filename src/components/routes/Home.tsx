import { useState } from "react"

import OuterContainer from "../reusable/OuterContainer"
import SectionContainer from "../reusable/SectionContainer"
import Button from "../reusable/Button"

import { loginSchema } from "../../backend/validation/zod-schemas"
import type { LoginSchemaType } from "../../backend/validation/zod-schemas"


const Home = () => {
  const [formData, setFormData] = useState<LoginSchemaType>({
    email: "",
    name: "",
    password: "",
    website: "",
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginSchemaType, string>>
  >({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    const result = loginSchema.safeParse(formData)

      if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginSchemaType, string>> = {}

        for (const err of result.error.issues) {  // issues är samma som errors
          const field = err.path[0] as keyof LoginSchemaType
          fieldErrors[field] = err.message
        }

        setErrors(fieldErrors)
        return
    }
    setErrors({})
    console.log("VALID DATA:", result.data)
  }

  return (
    <OuterContainer>
      <h1 className="font-bold italic text-2xl md:text-4xl mt-4">Sign In Form</h1>
      <SectionContainer>
        <form className="flex flex-col items-center gap-6 text-letter dark:text-letter-dark h-auto w-full" id="login-form" noValidate onSubmit={handleSubmit}>
          
          {/* Email */}
          <label htmlFor="login-email" className="sr-only">
            Email
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="login-email"
            name="login-email"
            type="login-email"
            placeholder="Email..."
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email && (
            <p className="text-error text-sm lg:text-base" id="login-email-error" role="alert">
              {errors.email}
            </p>
          )}

           <label htmlFor="login-name" className="sr-only">
            Name
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="login-name"
            name="login-name"
            type="login-name"
            placeholder="Name..."
            value={formData.email}
            onChange={handleChange}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-name-error" : undefined}
          />
          {errors.name && (
            <p className="text-error text-sm lg:text-base" id="login-name-error" role="alert">
              {errors.name}
            </p>
          )}

          {/* Password */}
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="login-password"
            name="login-password"
            type="login-password"
            placeholder="Password..."
            value={formData.password}
            onChange={handleChange}
            required
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "login-password-error" : undefined}
          />
          {errors.password && (
            <p className="text-error text-sm lg:text-base" id="login-password-error" role="alert">
              {errors.password}
            </p>
          )}

          {/* Honeypot */}
          <label htmlFor="website" className="sr-only">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="text"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-2455 p-0 border-0 m-0 w-px h-px"
          />

          <Button type="submit" label="Start sign in..." title="Sign in"/>
        </form>
      </SectionContainer>
    </OuterContainer>
  )
}

export default Home