import { useState, useEffect } from "react"
import { ArrowUpIcon } from "@/components/icons/lucide-arrow-up"
import { ArrowDownIcon } from "@/components/icons/lucide-arrow-down"


type UserFrontendType = {
    _id: string;
    name: string;
    role: | "User" | "Admin";
    createdAt: string;
}

const UsersList = () => {
    const [errorMsg, setErrorMsg] = useState<string>("")
    const [successMsg, setSuccessMsg] = useState<string>("")
    const [users, setUsers] = useState<UserFrontendType[]>([]);
    const [viewBookings, setViewBookings] = useState<boolean>(false)

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal;
        const fetchUsers = async(): Promise<void> => {
            try {
                const res = await fetch("http://localhost:3000/api/users", {
                    method: "GET",
                    signal,
                    credentials: "include",
                });

                if(!res.ok){
                    setErrorMsg("Could not reach server")
                    setUsers([])
                    return
                }

                const data = await res.json();

                if(data.success){
                    setUsers(data.users)  
                    setErrorMsg("")
                }
                else {
                    setUsers([])
                    setErrorMsg(data.error ?? "Could not fetch users")
                }
            } catch(err){
                if (err instanceof DOMException && err.name === "AbortError") return
                setErrorMsg("Could not fetch users")
                setUsers([])
            }
            
        }
        fetchUsers()
        return () => controller.abort()
    }, [])

    const handleDeleteUser = async(userId: string) => {
        if(!userId) return
        try{
            const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if(!res.ok){
                setErrorMsg("Failed to delete user");
                return;
            }

            const data = await res.json();

            if(data.success){
                setErrorMsg("");
                setUsers(prev => (prev.filter(u => u._id !== userId)))
                setSuccessMsg(data.message);
                setTimeout(() => {
                    setSuccessMsg("")
                }, 1000)
            } else {
                setErrorMsg(data.error || "Failed to delete user")
            }
        } catch{
            setErrorMsg("Server Error");
        }
    }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {!errorMsg && users.length > 0 && (
        <ul className="flex flex-col items-center justify-center w-full h-auto divide-y divide-gray-300 dark:divide-gray-700">
          {users.map(user => (
            <li
              className="flex flex-col md:flex-row items-center justify-evenly h-auto w-full p-4 gap-4"
              key={user._id}
            >
           
              <div className="flex flex-row items-center justify-evenly gap-10 md:gap-4 w-full md:w-1/2">
               {!viewBookings ? (
                <button onClick={() => setViewBookings(prev => !prev)} className="[&_svg]:size-5 md:[&_svg]:size-6 cursor-pointer mb-1">
                    <ArrowDownIcon />
                </button>
                ) : (
                <button onClick={() => setViewBookings(prev => !prev)} className="[&_svg]:size-5 md:[&_svg]:size-6 cursor-pointer mb-1">
                    <ArrowUpIcon />
                </button>
                ) }
                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                  Name: <span className="font-semibold">{user.name}</span>
                </p>

                <div className="flex items-center gap-2">
                  <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">Role: <span className="font-semibold">{user.role}</span></p>
                </div>
              </div>

              <div className="flex flex-row items-center justify-evenly gap-10 md:gap-4 w-full md:w-1/2">
                <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">
                  Created: <span className="font-semibold">{new Date(user.createdAt).toLocaleString("sv-SE", {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", "")}</span>
                </p>
               
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    type="button"
                    aria-label={`Delete user: ${user.name}`}
                    className="text-error text-xs sm:text-sm md:text-base p-2 border border-black dark:border-white rounded-md cursor-pointer"
                  >
                    Delete
                  </button>
               
              </div>
            </li>
          ))}
        </ul>
      )}

      {!errorMsg && users.length === 0 && (
        <p className="text-letter dark:text-letter-dark font-semibold text-xs md:text-sm">No Users Exist</p>
      )}

      {errorMsg && users.length < 1 && (
        <p className="text-error text-xs md:text-sm">{errorMsg}</p>
      )}

       {successMsg && (
         <p className="text-success text-xs md:text-sm">{successMsg}</p>
      )}
    </div>
  )
}

export default UsersList