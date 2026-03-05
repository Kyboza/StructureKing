import type { ReactNode } from 'react'

const OuterContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex h-auto w-full flex-col items-center justify-center">
            {children}
        </div>
    )
}

export default OuterContainer
