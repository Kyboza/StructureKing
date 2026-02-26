import { useState } from "react"

import { useAuthCheck } from "../../frontend-utils/useAuthCheck"
import { useNavigate } from "react-router-dom"

import OuterContainer from "../reusable/OuterContainer"
import SectionContainer from "../reusable/SectionContainer"
import Button from "../reusable/Button"
import Divider from "../reusable/Divider"

import { loginSchema } from "../../backend/validation/zod-schemas"
import { registerSchema } from "../../backend/validation/zod-schemas"
import type { LoginSchemaType } from "../../backend/validation/zod-schemas"
import type { RegisterSchemaType } from "../../backend/validation/zod-schemas"



const Home = () => {

  const [isSignInActive, setIsSignInActive] = useState<boolean>(true);
  const [generalError, setGeneralError] = useState<string>("")
  const navigate = useNavigate();

  useAuthCheck({require: "none"})

// LOGIN
    const [loginFormData, setLoginFormData] = useState<LoginSchemaType>({
      email: "",
      username: "",
      password: "",
      website: "",
    })

    const [loginErrors, setLoginErrors] = useState<
      Partial<Record<keyof LoginSchemaType, string>>
    >({})

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target

      setLoginFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }

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

  // Rensa tidigare errors
  setLoginErrors({});

  try {
    // 2️⃣ Skicka login request till backend
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: loginFormData.email,
        password: loginFormData.password,
        website: loginFormData.website // honeypot
      }),
      credentials: "include" // så cookies sätts
    });

    const data = await res.json();

    // 3️⃣ Hantera backend-response
    if (!data.success) {
      setLoginErrors(data.error || "Login failed" );
      return;
    }

    // 4️⃣ Om login lyckades
    alert("Login successful!");
    // Här kan du spara access_token i context/state om du vill
    // t.ex. setAuth({ accessToken: data.accessToken });

    // Rensa formulär
    setLoginFormData({
      email: "",
      username: "",
      password: "",
      website: ""
    });

    // Om du har en dashboard-sida, navigera dit
    // navigate("/dashboard");
    navigate("/dashboard")

  } catch (err) {
    console.error("Login error:", err);
    setGeneralError("Server error. Please try again later." );
  }
};


  // REGISTER
  const [registerFormData, setRegisterFormData] = useState<RegisterSchemaType>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    website: ""
  });

  const [registerErrors, setRegisterErrors] = useState<Partial<Record<keyof RegisterSchemaType, string>>>({});

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target
    setRegisterFormData(prev => ({...prev, [name]: value}))
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

  // Rensa tidigare errors
  setRegisterErrors({});

  try {
    // 2️⃣ Skicka request till backend
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: registerFormData.email,
        username: registerFormData.username,
        password: registerFormData.password,
        website: registerFormData.website // honeypot
      })
    });

    const data = await res.json();

    // 3️⃣ Hantera backend-svar
    if (!data.success) {
      // Om backend skickar field-specifika errors
      if (data.fieldErrors) {
        setRegisterErrors(data.fieldErrors);
      } else {
        // Annars generellt fel
        setGeneralError( data.error || "Registration failed" );
      }
      return;
    }

    // 4️⃣ Om allt gick bra
    alert("User registered successfully!");
    setRegisterFormData({
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      website: ""
    });

    // Om du vill, byt till sign in form
    setIsSignInActive(true);

  } catch (err) {
    console.error("Error during registration:", err);
    setGeneralError("Server error. Please try again later.");
  }
};

  return (
    <OuterContainer>
      {isSignInActive ? (<h1 className="font-bold italic text-2xl md:text-4xl mt-4">Sign In Form</h1>) : (<h1 className="font-bold italic text-2xl md:text-4xl mt-4">Register Form</h1>)}
      <SectionContainer>
        <form className="flex flex-col items-center gap-6 text-letter dark:text-letter-dark h-auto w-full" id={`${isSignInActive ? "login-form" : "register-form"}`} noValidate onSubmit={isSignInActive ? handleLoginSubmit : handleRegisterSubmit}>
          
          {isSignInActive ? (
            <>
            <label htmlFor="login-email" className="sr-only">
              Email
            </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="login-email"
            name="email"
            type="login-email"
            placeholder="Email..."
            value={loginFormData.email}
            onChange={handleLoginChange}
            required
            aria-invalid={!!loginErrors.email}
            aria-describedby={loginErrors.email ? "login-email-error" : undefined}
          />
          {loginErrors.email && (
            <p className="text-error text-sm lg:text-base" id="login-email-error" role="alert">
              {loginErrors.email}
            </p>
          )}

           <label htmlFor="login-username" className="sr-only">
            Username
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="login-username"
            name="username"
            type="login-username"
            placeholder="Username..."
            value={loginFormData.username}
            onChange={handleLoginChange}
            required
            aria-invalid={!!loginErrors.email}
            aria-describedby={loginErrors.email ? "login-username-error" : undefined}
          />
          {loginErrors.username && (
            <p className="text-error text-sm lg:text-base" id="login-username-error" role="alert">
              {loginErrors.username}
            </p>
          )}

          {/* Password */}
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="login-password"
            name="password"
            type="login-password"
            placeholder="Password..."
            value={loginFormData.password}
            onChange={handleLoginChange}
            required
            aria-invalid={!!loginErrors.password}
            aria-describedby={loginErrors.password ? "login-password-error" : undefined}
          />
          {loginErrors.password && (
            <p className="text-error text-sm lg:text-base" id="login-password-error" role="alert">
              {loginErrors.password}
            </p>
          )}

          {/* Honeypot */}
          <label htmlFor="login-website" className="sr-only">
            Website
          </label>
          <input
            id="login-website"
            name="website"
            type="text"
            value={loginErrors.website}
            onChange={handleLoginChange}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-2455 p-0 border-0 m-0 w-px h-px"
          />
          </>
          ) : (
          <>
          <label htmlFor="register-email" className="sr-only">
              Email
            </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="register-email"
            name="email"
            type="register-email"
            placeholder="Email..."
            value={registerFormData.email}
            onChange={handleRegisterChange}
            required
            aria-invalid={!!registerErrors.email}
            aria-describedby={registerErrors.email ? "register-email-error" : undefined}
          />
          {registerErrors.email && (
            <p className="text-error text-sm lg:text-base" id="register-email-error" role="alert">
              {registerErrors.email}
            </p>
          )}

           <label htmlFor="register-username" className="sr-only">
            Username
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="register-username"
            name="username"
            type="register-username"
            placeholder="Username..."
            value={registerFormData.username}
            onChange={handleRegisterChange}
            required
            aria-invalid={!!registerErrors.username}
            aria-describedby={registerErrors.username ? "register-username-error" : undefined}
          />
          {registerErrors.username && (
            <p className="text-error text-sm lg:text-base" id="register-username-error" role="alert">
              {registerErrors.username}
            </p>
          )}

          {/* Password */}
          <label htmlFor="register-password" className="sr-only">
            Password
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="register-password"
            name="password"
            type="register-password"
            placeholder="Password..."
            value={registerFormData.password}
            onChange={handleRegisterChange}
            required
            aria-invalid={!!registerErrors.password}
            aria-describedby={registerErrors.password ? "register-password-error" : undefined}
          />
          {registerErrors.password && (
            <p className="text-error text-sm lg:text-base" id="register-password-error" role="alert">
              {registerErrors.password}
            </p>
          )}

          <label htmlFor="register-password-confirm" className="sr-only">
            Confirm Password
          </label>
          <input
            className='placeholder:text-gray-500 dark:placeholder:text-letter-dark placeholder:text-base md:placeholder:text-lg text-sm md:text-base w-4/5 h-10 md:h-14 border rounded-md border-gray-500 shadow-md p-2'
            id="register-password-confirm"
            name="confirmPassword"
            type="register-password-confirm"
            placeholder="Confirm Password..."
            value={registerFormData.confirmPassword}
            onChange={handleRegisterChange}
            required
            aria-invalid={!!registerErrors.confirmPassword}
            aria-describedby={registerErrors.confirmPassword ? "register-confirm-password-error" : undefined}
          />
          {registerErrors.password && (
            <p className="text-error text-sm lg:text-base" id="register-confirm-password-error" role="alert">
              {registerErrors.confirmPassword}
            </p>
          )}

          {/* Honeypot */}
          <label htmlFor="register-website" className="sr-only">
            Website
          </label>
          <input
            id="register-website"
            name="website"
            type="text"
            value={registerErrors.website}
            onChange={handleRegisterChange}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-2455 p-0 border-0 m-0 w-px h-px"
          />
          </>
          )}
         

          {isSignInActive ? (<Button type="submit" label="Start sign in..." title="Sign in"/>) : (<Button type="submit" label="Start register..." title="Register"/>)}
        </form>


        <Divider/>
        <div className="flex flex-row items-center justify-center gap-1">
          {isSignInActive ? (
            <>
            <p className="text-sm md:text-base">Don't have an account?</p>
            <button aria-label="Go to register" onClick={() => {setIsSignInActive(prev => !prev); setLoginFormData(prev => ({...prev, email: "", username: "", password: ""} ))}} className="font-semibold text-sm md:text-base italic text-primary cursor-pointer">Register</button>
            </>
          ) : (
             <>
            <p className="text-sm md:text-base">Already have an account?</p>
            <button aria-label="Go to sign in" onClick={() => {setIsSignInActive(prev => !prev); setRegisterFormData(prev => ({...prev, email: "", username: "", password: ""}))}} className="font-semibold text-sm md:text-base italic text-primary cursor-pointer">Sign In</button>
            </>
          )}
         
        </div>
      </SectionContainer>
    </OuterContainer>
  )
}

export default Home