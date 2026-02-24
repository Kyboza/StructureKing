import { useDropdown } from "../../contexts/hooks/useDropdown"

const Header = () => {
    const {isOpen, setIsOpen} = useDropdown();

  return (
    <header className="h-25 border-b border-gray-500 shadow-md bg-primary flex flex-row items-center justify-between z-10">
        <div className="flex basis-1/3">
        <button onClick={() =>setIsOpen(prev => !prev)} id="dropdown-toggle" aria- aria-haspopup="true" aria-label={`${isOpen ? 'Close menu' : 'Open menu'}`} className="cursor-pointer h-12 w-12 flex flex-col justify-evenly items-center ml-2 p-2">
            <>
           {[0,1,2].map((_, i) => (
            <span
                key={i}
                className={`block h-0.5 w-4/5 bg-background-dark dark:bg-background rounded-md transition-all duration-300
                ${i === 0 ? (isOpen ? 'rotate-45 translate-y-2' : 'rotate-0 translate-y-0') : ''}
                ${i === 1 ? (isOpen ? 'opacity-0' : 'opacity-100') : ''}
                ${i === 2 ? (isOpen ? '-rotate-45 -translate-y-2' : 'rotate-0 translate-y-0') : ''}
                `}
            />
            ))}
            </>
        </button>
        </div>

        <div className="h-full basis-1/3 flex items-center justify-center p-2 cursor-pointer">
            <h1 className="font-semibold italic font-title text-xl md:text-3xl">Structure King</h1>
        </div>

        <div className="h-full basis-1/3 flex items-center justify-center">
            <img
                src="/images/logo/logo.webp"
                alt="Structure King's Logotyp."
                className="object-contain max-w-full max-h-full" 
            />
        </div>
    </header>
  )
}

export default Header