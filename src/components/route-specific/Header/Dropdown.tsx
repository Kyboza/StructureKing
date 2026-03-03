import { useDropdown } from '@/contexts/hooks/useDropdown'
import { useNavigate } from 'react-router-dom'

const Dropdown = () => {
  const { isOpen } = useDropdown();
  const navigate = useNavigate();

  const handleLogout = async() => {
    try {
        const res = await fetch("http://localhost:3000/api/logout", {
            method: "DELETE",
            credentials: "include",
        });
        if(!res.ok) return;
        navigate("/");
    } catch{
        return
    }
  }

  return (
    <ul
      className={`
        w-48 bg-white dark:bg-black
        origin-top transform transition-transform duration-300 ease-in-out
        border rounded-md border-black dark:border-gray-500
        absolute top-25 left-1 mt-1
        ${isOpen ? 'scale-y-100' : 'scale-y-0'}
        overflow-hidden
        z-20
      `}
    >
      <li className='text-letter dark:text-letter-dark text-sm md:text-base font-semibold h-auto p-4 w-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'>
        <button type='button' aria-label='Logga ut' onClick={handleLogout}>
            Logga Ut
        </button>
      </li>
    </ul>
  )
}

export default Dropdown