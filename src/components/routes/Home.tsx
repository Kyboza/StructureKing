// frontend/pages/Home.tsx
import { useState } from "react";

import { useAuthCheck } from "@/frontend-utils/useAuthCheck";
import OuterContainer from "../reusable/OuterContainer";
import SectionContainer from "../reusable/SectionContainer";
import Divider from "../reusable/Divider";

import LoginForm from "../forms/LoginForm";
import RegisterForm from "../forms/RegisterForm";

const Home = () => {
  const authStatus = useAuthCheck({ require: "None" });
  const [isSignInActive, setIsSignInActive] = useState<boolean>(true);
  if (authStatus === null) return null; // eller <Loading />

  return (
    <OuterContainer>
      <SectionContainer>
        {isSignInActive ? <LoginForm /> : <RegisterForm onRegisterSuccess={() => setIsSignInActive(true)}/>}

        <Divider />

        <div className="flex flex-row items-center justify-center gap-1 mt-4">
          {isSignInActive ? (
            <>
              <p className="text-sm md:text-base">Don't have an account?</p>
              <button
                aria-label="Go to register"
                onClick={() => setIsSignInActive(false)}
                className="font-semibold text-sm md:text-base italic text-primary cursor-pointer"
              >
                Register
              </button>
            </>
          ) : (
            <>
              <p className="text-sm md:text-base">Already have an account?</p>
              <button
                aria-label="Go to sign in"
                onClick={() => setIsSignInActive(true)}
                className="font-semibold text-sm md:text-base italic text-primary cursor-pointer"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </SectionContainer>
    </OuterContainer>
  );
};

export default Home;