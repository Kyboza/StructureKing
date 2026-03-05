import type { ReactNode } from 'react'

import { DropdownProvider } from './context-providers/DropdownContext'

const AppContext = ({ children }: { children: ReactNode }) => {
    return <DropdownProvider>{children}</DropdownProvider>
}

export default AppContext
