import { DropdownProvider } from "./context-providers/DropdownContext"
import type { ReactNode } from "react"

const AppContext = ({children}: {children: ReactNode}) => {
  return (
    <DropdownProvider>
      {children}
    </DropdownProvider>
  )
}

export default AppContext