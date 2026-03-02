import { useState, useEffect } from "react"

type ReturnedRoomsType = {
    _id: string,
    name: string,
    capacity: number,
    type: |"Workshop" | "Conference"
}

const RoomsList = ({refreshKey}: {refreshKey: number}) => {
const [rooms, setRooms] = useState<ReturnedRoomsType[]>([]);
const [errorMsg, setErrorMsg] = useState<string>("");

useEffect(() => {
  const controller = new AbortController();

  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/rooms", {method: "GET", signal: controller.signal, credentials:"include" });
      const data = await res.json();
      if(!res.ok){
        setErrorMsg("Could not reach server");
        setRooms([]);
        return;
      }
      if(data.success){
        setRooms(data.rooms);
      }
      else{
        setErrorMsg(data.error)
      }
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      setErrorMsg("Could not fetch Rooms");
      setRooms([])
    }
  };

  fetchRooms();

  return () => controller.abort(); // avbryt fetch när komponent unmountas
}, [refreshKey]);

const handleDeleteRoom = async (roomId: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if(!res.ok){
        setErrorMsg("Could not reach server");
        setRooms([]);
        return;
      }

    const data = await res.json()

    if(data.success){
        setRooms(prev => prev.filter(r => r._id !== roomId));
    } else {
        setErrorMsg(data.error)
    }
  } catch {
    setErrorMsg("Server Error");
  }
};
  return (
    <div className="flex flex-col items-center justify-center w-full">
        {!errorMsg && rooms.length > 0 && (
            <ul className="flex flex-col items-center justify-center w-full h-auto divide-y divide-gray-300 dark:divide-gray-700">
                {rooms.map((room) => (
                    <li className="flex flex-col md:flex-row items-center justify-evenly h-auto w-full p-4 gap-4" key={room._id}>
                        <div className="flex flex-row items-center justify-evenly gap-10 md:gap-4 w-full md:w-1/2">
                            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">Name: <span className="font-semibold">{room.name}</span></p>
                            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">Capacity: <span className="font-semibold">{room.capacity}</span></p>
                        </div>
                        <div className="flex flex-row items-center justify-evenly gap-10 md:gap-4 w-full md:w-1/2">
                            <p className="text-letter dark:text-letter-dark text-xs sm:text-sm md:text-base">Type: <span className="font-semibold">{room.type}</span></p>
                            <button onClick={() => handleDeleteRoom(room._id)} type="button" aria-label="Delete room" className="text-error text-xs sm:text-sm md:text-base p-2 border border-black dark:border-white rounded-md cursor-pointer">Delete Room</button>
                        </div>
                    </li>
                ))}
            </ul>
        )}

        {!errorMsg && rooms.length === 0 && (
            <p className="text-letter dark:text-letter-dark font-semibold text-xs md:text-sm">No Rooms Created</p>
        )}

        {errorMsg && rooms.length < 1 && (
            <p className="text-error text-xs md:text-sm">{errorMsg}</p>
        )} 

        
    </div>
  )
}

export default RoomsList