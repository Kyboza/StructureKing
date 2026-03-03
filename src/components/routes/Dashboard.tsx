import { useState } from "react";
import { useAuthCheck } from "@/frontend-utils/useAuthCheck";
import OuterContainer from "../reusable/OuterContainer";
import SectionContainer from "../reusable/SectionContainer";
import BookingsList from "../route-specific/Dashboard/BookingList";
import BookingForm from "../forms/BookingForm";

const Dashboard = () => {
  const authStatus = useAuthCheck({ require: "User" });
  const [refreshKey, setRefreshKey] = useState<number>(0);

  if (!authStatus || !authStatus.authenticated) return null;

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <OuterContainer>
      <h1 className="font-bold text-3xl md:text-5xl mt-4">
        Dashboard - Booking
      </h1>

      <SectionContainer>
        <h2 className="font-semibold text-xl md:text-2xl mb-2">
          Create Booking
        </h2>
        <BookingForm onSuccess={triggerRefresh} />
      </SectionContainer>

      <SectionContainer>
        <h2 className="font-semibold text-xl md:text-2xl mb-2">
          Current Bookings
        </h2>
        <BookingsList
          refreshKey={refreshKey}
          currentUser={authStatus.username}
        />
      </SectionContainer>
    </OuterContainer>
  );
};

export default Dashboard;