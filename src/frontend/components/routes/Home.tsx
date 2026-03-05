// frontend/pages/Home.tsx
import { useState } from 'react'


import LoginForm from '../forms/LoginForm'
import RegisterForm from '../forms/RegisterForm'
import Divider from '../reusable/Divider'
import OuterContainer from '../reusable/OuterContainer'
import SectionContainer from '../reusable/SectionContainer'

import { useAuthCheck } from '@/frontend/frontend-utils/useAuthCheck'


const Home = () => {
    const authStatus = useAuthCheck({ require: 'None' })
    const [isSignInActive, setIsSignInActive] = useState<boolean>(true)
    if (authStatus === null) return null

    return (
        <OuterContainer>
            <SectionContainer>
                {isSignInActive ? (
                    <LoginForm />
                ) : (
                    <RegisterForm
                        onRegisterSuccess={() => setIsSignInActive(true)}
                    />
                )}

                <Divider />

                <div className="mt-4 flex flex-row items-center justify-center gap-1">
                    {isSignInActive ? (
                        <>
                            <p className="text-sm md:text-base">
                                Don't have an account?
                            </p>
                            <button
                                aria-label="Go to register"
                                onClick={() => setIsSignInActive(false)}
                                className="text-primary cursor-pointer text-sm font-semibold italic md:text-base"
                            >
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm md:text-base">
                                Already have an account?
                            </p>
                            <button
                                aria-label="Go to sign in"
                                onClick={() => setIsSignInActive(true)}
                                className="text-primary cursor-pointer text-sm font-semibold italic md:text-base"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </div>
            </SectionContainer>
        </OuterContainer>
    )
}

export default Home
