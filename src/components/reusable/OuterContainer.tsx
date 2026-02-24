import type { ReactNode } from "react"

const OuterContainer = ({children}: {children: ReactNode}) => {
  return (
    <div className='w-full h-auto flex flex-col items-center justify-center'>
        {children}
    </div>
  )
}

export default OuterContainer