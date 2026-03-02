import { useState } from "react";
import Button from "../reusable/Button";
import { roomsSchema} from "@/backend/validation/zod-schemas";
import type { RoomsSchemaType } from "@/backend/validation/zod-schemas";

type RoomFrontendDataType = {
    name: string;
    capacity: string;
    type: |"Workspace" | "Conference";
    website: string;
}

type RoomFormProps = {
  onSuccess?: () => void;
};

const RoomForm = ({onSuccess}: RoomFormProps) => {
    const [formData, setFormData] = useState<RoomFrontendDataType>({
        name: "",
        capacity: "",
        type: "Workspace",
        website: ""
    });
    const [roomErrors, setRoomErrors] = useState<Partial<Record<keyof RoomsSchemaType, string>>>({})
    const [generalError, setGeneralError] = useState<string>("")
    const [successMessage, setSuccessMessage] = useState<string>("")



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}))
    }

    const handleSubmit = async(e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = roomsSchema.safeParse(formData);
        if(!result.success){
            const fieldErrors: Partial<Record<keyof RoomsSchemaType, string>> = {};
            for(const err of result.error.issues){
                const field = err.path[0] as keyof RoomsSchemaType;
                fieldErrors[field] = err.message;
            }
            setRoomErrors(fieldErrors);
            return;
        }

        setRoomErrors({});
        setGeneralError("");

        try {
            const res = await fetch("http://localhost:3000/api/rooms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
                credentials: "include"
        });
        const data = await res.json();

        if (!data.success) {
            setGeneralError(data.error || "Room creation failed");
            return;
        }

        setFormData({
            name: "",
            capacity: "",
            type: "Workspace",
            website: "",
        });
        setSuccessMessage(data.message);

        if (onSuccess) onSuccess();

        setTimeout(() => {
            setSuccessMessage("")
        }, 1500)
      

        } catch(error){
            console.error("Error during room creation:", error);
            setGeneralError("Server error. Please try again later.");
        }
    }
    

  return (
     <>
        <div className="flex justify-center items-center w-full">
            <h1 className="font-bold italic text-2xl md:text-4xl mt-4">Rooms</h1>
        </div>
    
        <form
          className="flex flex-col items-center gap-6 text-letter dark:text-letter-dark h-auto w-full"
          onSubmit={handleSubmit}
          noValidate
        >
          <input
            name="name"
            type="name"
            placeholder="Name..."
            autoComplete="off"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full h-10 md:h-14 border rounded-md p-2 placeholder:text-gray-500 dark:placeholder:text-letter-dark"
          />
          {roomErrors.name && <p className="text-error text-xs md:text-sm">{roomErrors.name}</p>}

          <input
            name="capacity"
            type="text"
            placeholder="Capacity..."
            autoComplete="off"
            value={formData.capacity}
            onChange={handleChange}
            required
            className="placeholder:text-gray-500 dark:placeholder:text-letter-dark w-full h-10 md:h-14 border rounded-md p-2"
          />
          {roomErrors.capacity && <p className="text-error text-xs md:text-sm">{roomErrors.capacity}</p>}

       <div className="flex flex-row items-start w-full gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-gray-500 dark:text-letter-dark text-sm md:text-base">Workspace</span>
                <input
                name="type"
                type="radio"
                value="Workspace"
                checked={formData.type === "Workspace"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as RoomsSchemaType["type"] }))}
                className="w-5 h-5 accent-black cursor-pointer"
                />
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-gray-500 dark:text-letter-dark text-sm md:text-base">Conference</span>
                <input
                name="type"
                type="radio"
                value="Conference"
                checked={formData.type === "Conference"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as RoomsSchemaType["type"] }))}
                className="w-5 h-5 accent-black cursor-pointer"
                />
            </label>
            </div>
          {roomErrors.type && <p className="text-error text-xs md:text-sm">{roomErrors.type}</p>}


          {/* Honeypot */}
          <input
            name="website"
            type="text"
            value={formData.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-2455 p-0 border-0 m-0 w-px h-px"
          />

          {generalError && <p className="text-error text-xs md:text-sm">{generalError}</p>}
          {successMessage && <p className="text-success text-xs md:text-sm">{successMessage}</p>}

          <Button type="submit" label="Create Room" title="Create Room" />
        </form>
</>
)
}

export default RoomForm