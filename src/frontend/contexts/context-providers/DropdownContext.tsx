import { useState } from 'react'
import type { ReactNode } from 'react'

import { DropdownContext } from '../hooks/useDropdown'

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    return (
        <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </DropdownContext.Provider>
    )
}
