import { useNavigate } from 'react-router-dom'

import { useDropdown } from '../../../contexts/hooks/useDropdown'

const Dropdown = () => {
    const { isOpen } = useDropdown()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (!res.ok) return
            navigate('/')
        } catch {
            return
        }
    }

    return (
        <ul
            className={`absolute top-25 left-1 mt-1 w-48 origin-top transform rounded-md border border-black bg-white transition-transform duration-300 ease-in-out dark:border-gray-500 dark:bg-black ${isOpen ? 'scale-y-100' : 'scale-y-0'} z-20 overflow-hidden`}
        >
            <li className="text-letter dark:text-letter-dark h-auto w-full cursor-pointer p-4 text-sm font-semibold hover:bg-gray-100 md:text-base dark:hover:bg-gray-800">
                <button
                    type="button"
                    aria-label="Logga ut"
                    onClick={handleLogout}
                >
                    Logga Ut
                </button>
            </li>
        </ul>
    )
}

export default Dropdown
