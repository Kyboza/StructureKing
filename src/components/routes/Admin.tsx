import { useState } from "react";

import { useAuthCheck } from "@/frontend-utils/useAuthCheck"

import OuterContainer from "../reusable/OuterContainer";
import SectionContainer from "../reusable/SectionContainer";
import RoomForm from "../forms/RoomForm";
import RoomsList from "../route-specific/Admin/RoomsList";

const Admin = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const authStatus = useAuthCheck({require:"Admin"})
    if (authStatus === null) return null;

    const handleRoomCreated = () => {
      setRefreshKey(prev => prev + 1);
    };

  return (
    <OuterContainer>
      <SectionContainer>
         <RoomForm onSuccess={handleRoomCreated} />
      </SectionContainer>
      <SectionContainer>
         <RoomsList refreshKey={refreshKey} />
      </SectionContainer>
    </OuterContainer>
  )
}

export default Admin