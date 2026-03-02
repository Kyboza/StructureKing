// frontend/components/forms/LoginForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../reusable/Button";

import { EyeIcon } from "../icons/lucide-eye";
import { EyeOffIcon } from "../icons/lucide-eye-off";

import { loginSchema } from "../../backend/validation/zod-schemas";
import type { LoginSchemaType } from "../../backend/validation/zod-schemas";

const LoginForm = () => {
  const navigate = useNavigate();

  // Form state
  const [loginFormData, setLoginFormData] = useState<LoginSchemaType>({
    email: "",
    username: "",
    password: "",
    website: "",
  });
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginSchemaType, string>>>({});
  const [generalLoginError, setGeneralLoginError] = useState<string>("");
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string>("");
  const [passwordBool, setPasswordBool] = useState<boolean>(true)

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1️⃣ Frontend-validering med Zod
    const result = loginSchema.safeParse(loginFormData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginSchemaType, string>> = {};
      for (const err of result.error.issues) {
        const field = err.path[0] as keyof LoginSchemaType;
        fieldErrors[field] = err.message;
      }
      setLoginErrors(fieldErrors);
      return;
    }

    // 2️⃣ Rensa tidigare errors
    setLoginErrors({});
    setGeneralLoginError("");

    try {
      // 3️⃣ Skicka login request till backend
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginFormData),
        credentials: "include", // så cookies sätts
      });

      const data = await res.json();

      if (!data.success) {
        setGeneralLoginError(data.error || "Login failed");
        return;
      }

      setLoginFormData({
        email: "",
        username: "",
        password: "",
        website: "",
      });
      setLoginSuccessMessage(data.message);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500)

      
    } catch (err) {
      console.error("Login error:", err);
      setGeneralLoginError("Server error. Please try again later.");
    }
  };

  return (
    <>
        <div className="flex justify-center items-center w-full">
            <h1 className="font-bold italic text-2xl md:text-4xl mt-4">Sign In Form</h1>
        </div>
    
        <form
          className="flex flex-col items-center gap-6 text-letter dark:text-letter-dark h-auto w-full"
          onSubmit={handleLoginSubmit}
          noValidate
        >
          <input
            name="email"
            type="email"
            placeholder="Email..."
            autoComplete="off"
            value={loginFormData.email}
            onChange={handleLoginChange}
            required
            className="w-full h-10 md:h-14 border rounded-md p-2 placeholder:text-gray-500 dark:placeholder:text-letter-dark"
          />
          {loginErrors.email && <p className="text-error text-xs md:text-sm">{loginErrors.email}</p>}

          <input
            name="username"
            type="text"
            placeholder="Username..."
            autoComplete="off"
            value={loginFormData.username}
            onChange={handleLoginChange}
            required
            className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 md:h-14 border rounded-md p-2"
          />
          {loginErrors.username && <p className="text-error text-xs md:text-sm">{loginErrors.username}</p>}

        <div className="relative w-full">
            <input
                name="password"
                type={passwordBool ? "password" : "text"} 
                placeholder="Password..."
                autoComplete="off"
                value={loginFormData.password}
                onChange={handleLoginChange}
                required
                className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 md:h-14 border rounded-md p-2" 
            />

            <button
                type="button"
                aria-label={passwordBool ? "Hide password" : "Show password"}
                onClick={() => setPasswordBool(prev => !prev)}
                className="absolute inset-y-0 right-2 flex items-center justify-center p-1 text-gray-500 hover:text-gray-700"
            >
                {passwordBool ? <EyeIcon /> : <EyeOffIcon />}
            </button>
        </div>

        {loginErrors.password && (
        <p className="text-error text-xs md:text-sm">{loginErrors.password}</p>
        )}

          {/* Honeypot */}
          <input
            name="website"
            type="text"
            value={loginFormData.website}
            onChange={handleLoginChange}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-2455 p-0 border-0 m-0 w-px h-px"
          />

          {generalLoginError && <p className="text-error text-xs md:text-sm">{generalLoginError}</p>}
          {loginSuccessMessage && <p className="text-success text-xs md:text-sm">{loginSuccessMessage}</p>}

          <Button type="submit" label="Sign In" title="Sign In" />
        </form>
</>
  );
};

export default LoginForm;