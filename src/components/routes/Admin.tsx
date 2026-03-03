import { useState } from "react";

import { useAuthCheck } from "@/frontend-utils/useAuthCheck"

import OuterContainer from "../reusable/OuterContainer";
import SectionContainer from "../reusable/SectionContainer";
import RoomForm from "../forms/RoomForm";
import RoomsList from "../route-specific/Admin/RoomsList";
import UsersList from "../route-specific/Admin/UsersList";

const Admin = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const authStatus = useAuthCheck({require:"Admin"})
    if (authStatus === null) return null;

    const handleRoomCreated = () => {
      setRefreshKey(prev => prev + 1);
    };

  return (
    <OuterContainer>
      <h1 className="font-bold text-3xl md:text-5xl mt-4">Välkommen Johan</h1>
      <h2 className="font-semibold italic text-2xl md:text-4xl mt-4">Rooms</h2>
      <SectionContainer>
         <RoomForm onSuccess={handleRoomCreated} />
      </SectionContainer>
      <SectionContainer>
         <RoomsList refreshKey={refreshKey} />
      </SectionContainer>
      <h2 className="font-semibold italic text-2xl md:text-4xl mt-4">Users</h2>
      <SectionContainer>
        <UsersList/>
      </SectionContainer>
    </OuterContainer>
  )
}

export default Admin