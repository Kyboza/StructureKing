import { useState } from 'react'

import { useAuthCheck } from '../../frontend-utils/useAuthCheck'
import BookingForm from '../forms/BookingForm'
import OuterContainer from '../reusable/OuterContainer'
import SectionContainer from '../reusable/SectionContainer'
import BookingsList from '../route-specific/Dashboard/BookingList'

const Dashboard = () => {
    const authStatus = useAuthCheck({ require: 'User' })
    const [refreshKey, setRefreshKey] = useState<number>(0)

    if (!authStatus || !authStatus.authenticated) return null

    const triggerRefresh = () => setRefreshKey((prev) => prev + 1)

    return (
        <OuterContainer>
            <h1 className="mt-4 text-3xl font-bold md:text-5xl">
                Dashboard - Booking
            </h1>

            <SectionContainer>
                <h2 className="mb-2 text-xl font-semibold md:text-2xl">
                    Create Booking
                </h2>
                <BookingForm onSuccess={triggerRefresh} />
            </SectionContainer>

            <SectionContainer>
                <h2 className="mb-2 text-xl font-semibold md:text-2xl">
                    Current Bookings
                </h2>
                {authStatus.username && (
                    <BookingsList
                    refreshKey={refreshKey}
                    currentUser={authStatus.username}
                />
                )}
                
            </SectionContainer>
        </OuterContainer>
    )
}

export default Dashboard
