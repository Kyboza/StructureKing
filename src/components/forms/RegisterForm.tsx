// frontend/components/forms/RegisterForm.tsx
import { useState } from "react";

import Button from "../reusable/Button";

import { registerSchema } from "../../backend/validation/zod-schemas";
import type { RegisterSchemaType } from "../../backend/validation/zod-schemas";
import { EyeIcon } from "../icons/lucide-eye";
import { EyeOffIcon } from "../icons/lucide-eye-off";

const RegisterForm = ({onRegisterSuccess}: {onRegisterSuccess?: () => void}) => {

  // Form state
  const [registerFormData, setRegisterFormData] = useState<RegisterSchemaType>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    website: ""
  });
  const [registerErrors, setRegisterErrors] = useState<Partial<Record<keyof RegisterSchemaType, string>>>({});
  const [generalRegisterError, setGeneralRegisterError] = useState<string>("");
  const [registerSuccessMessage, setRegisterSuccessMessage] = useState<string>("");
  const [passwordBool, setPasswordBool] = useState<boolean>(true)
  const [confirmPasswordBool, setConfirmPasswordBool] = useState<boolean>(true)

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1️⃣ Validera frontend med Zod
    const result = registerSchema.safeParse(registerFormData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterSchemaType, string>> = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as keyof RegisterSchemaType;
        fieldErrors[field] = err.message;
      }
      setRegisterErrors(fieldErrors);
      return;
    }

    // 2️⃣ Rensa tidigare errors
    setRegisterErrors({});
    setGeneralRegisterError("");

    try {
      // 3️⃣ Skicka request till backend
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerFormData),
      });

      const data = await res.json();

      if (!data.success) {
        setGeneralRegisterError(data.error || "Registration failed");
        return;
      }

      setRegisterFormData({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        website: ""
      });
      setRegisterSuccessMessage(data.message);

    const success = true; 
    setTimeout(() => {
        if (success && onRegisterSuccess) {
            onRegisterSuccess();
        }
      }, 1500)
   

    } catch (err) {
      console.error("Error during registration:", err);
      setGeneralRegisterError("Server error. Please try again later.");
    }
  };

  return (
   <>
        <div className="flex justify-center items-center w-full">
            <h1 className="font-bold italic text-2xl md:text-4xl mt-4">Register Form</h1>
        </div>
   
        <form
          className="flex flex-col items-center gap-6 text-letter dark:text-letter-dark h-auto w-full"
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
            className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 md:h-14 border rounded-md p-2"
          />
          {registerErrors.email && <p className="text-error text-xs md:text-sm">{registerErrors.email}</p>}

          <input
            name="username"
            type="text"
            placeholder="Username..."
            autoComplete="off"
            value={registerFormData.username}
            onChange={handleRegisterChange}
            required
            className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 md:h-14 border rounded-md p-2"
          />
          {registerErrors.username && <p className="text-error text-xs md:text-sm">{registerErrors.username}</p>}

        <div className="w-full relative">
          <input
            name="password"
            type={`${passwordBool ? "password": "text"}`}
            placeholder="Password..."
            autoComplete="off"
            value={registerFormData.password}
            onChange={handleRegisterChange}
            required
            className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 md:h-14 pr-10 border rounded-md p-2"
          />
          <button
            type="button"
            aria-label={passwordBool ? "Hide password" : "Show password"}
            onClick={() => setPasswordBool(prev => !prev)}
            className="absolute inset-y-0 right-2 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
          >
            {passwordBool ? <EyeIcon/> : <EyeOffIcon/>}
          </button>
          </div>
          {registerErrors.password && <p className="text-error text-xs md:text-sm">{registerErrors.password}</p>}

          <div className="w-full relative">
            <input
                name="confirmPassword"
                type={`${confirmPasswordBool ? "password": "text"}`}
                placeholder="Confirm Password..."
                autoComplete="off"
                value={registerFormData.confirmPassword}
                onChange={handleRegisterChange}
                required
                className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 pr-10 md:h-14 border rounded-md p-2"
            />
            <button
                type="button"
                aria-label={confirmPasswordBool ? "Hide confirmedPassword" : "Show confirmedPassword"}
                onClick={() => setConfirmPasswordBool(prev => !prev)}
                className="absolute inset-y-0 right-2 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
            >
                {confirmPasswordBool ? <EyeIcon/> : <EyeOffIcon/>}
            </button>
          </div>
          {registerErrors.confirmPassword && <p className="text-error text-xs md:text-sm">{registerErrors.confirmPassword}</p>}

          {/* Honeypot */}
          <input
            name="website"
            type="text"
            value={registerFormData.website}
            onChange={handleRegisterChange}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-2455 p-0 border-0 m-0 w-px h-px"
          />

          {generalRegisterError && <p className="text-error text-xs md:text-sm">{generalRegisterError}</p>}
          {registerSuccessMessage && <p className="text-success text-xs md:text-sm">{registerSuccessMessage}</p>}

          <Button type="submit" label="Register" title="Register" />
        </form>

    </>
  );
};

export default RegisterForm;