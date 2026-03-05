import { createContext, useContext } from 'react'

type DropdownContextType = {
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DropdownContext = createContext<DropdownContextType | undefined>(
    undefined
)

export const useDropdown = () => {
    const context = useContext(DropdownContext)
    if (!context)
        throw new Error('useDropdown must be used within a DropdownProvider')
    return context
}
