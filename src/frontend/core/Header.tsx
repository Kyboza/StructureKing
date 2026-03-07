import Dropdown from '../components/route-specific/Header/Dropdown'
import { useDropdown } from '../contexts/hooks/useDropdown'

const Header = () => {
    const { isOpen, setIsOpen } = useDropdown()

    return (
        <>
            <header className="bg-primary relative z-10 flex h-25 flex-row items-center justify-between border-b border-gray-500 shadow-md">
                <div className="flex basis-1/3">
                    <button
                        onClick={() => setIsOpen((prev) => !prev)}
                        id="dropdown-toggle"
                        aria-haspopup="true"
                        aria-label={`${isOpen ? 'Close menu' : 'Open menu'}`}
                        className="ml-2 flex h-12 w-12 cursor-pointer flex-col items-center justify-evenly p-2"
                    >
                        <>
                            {[0, 1, 2].map((_, i) => (
                                <span
                                    key={i}
                                    className={`bg-background-dark dark:bg-background block h-0.5 w-4/5 rounded-md transition-all duration-300 ${i === 0 ? (isOpen ? 'translate-y-2 rotate-45' : 'translate-y-0 rotate-0') : ''} ${i === 1 ? (isOpen ? 'opacity-0' : 'opacity-100') : ''} ${i === 2 ? (isOpen ? '-translate-y-2 -rotate-45' : 'translate-y-0 rotate-0') : ''} `}
                                />
                            ))}
                        </>
                    </button>
                </div>

                <div className="flex h-full basis-1/3 cursor-pointer items-center justify-center p-2">
                    <h1 className="font-title text-xl font-semibold italic md:text-3xl">
                        Structure King
                    </h1>
                </div>

                <div className="flex h-full basis-1/3 items-center justify-center">
                    <img
                        src="/images/logo/logo.webp"
                        alt="Structure King's Logotyp."
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            </header>
            <Dropdown />
        </>
    )
}

export default Header
