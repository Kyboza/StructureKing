import type { ReactNode } from "react";

const SectionContainer = ({children}: {children: ReactNode}) => {
  return (
    <div className="w-[80vw] lg:w-[70vw] xl:w-[50vw] h-full p-4 gap-4 flex flex-col bg-background dark:bg-background-dark border border-gray-500 shadow-md mb-4 rounded-md mt-4">
        {children}
    </div>
  )
}

export default SectionContainer