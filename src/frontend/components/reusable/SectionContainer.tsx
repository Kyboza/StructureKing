import type { ReactNode } from 'react'

const SectionContainer = ({ children }: { children: ReactNode }) => {
    return (
        <div className="bg-background dark:bg-background-dark mt-4 mb-4 flex h-full w-[80vw] flex-col gap-4 rounded-md border border-gray-500 p-4 shadow-md lg:w-[70vw] xl:w-[50vw]">
            {children}
        </div>
    )
}

export default SectionContainer
