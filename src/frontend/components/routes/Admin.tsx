import { useState } from 'react'


import RoomForm from '../forms/RoomForm'
import OuterContainer from '../reusable/OuterContainer'
import SectionContainer from '../reusable/SectionContainer'
import RoomsList from '../route-specific/Admin/RoomsList'
import UsersList from '../route-specific/Admin/UsersList'

import { useAuthCheck } from '@/frontend/frontend-utils/useAuthCheck'


const Admin = () => {
    const [refreshKey, setRefreshKey] = useState(0)

    const authStatus = useAuthCheck({ require: 'Admin' })
    if (authStatus === null) return null

    const handleRoomCreated = () => {
        setRefreshKey((prev) => prev + 1)
    }

    return (
        <OuterContainer>
            <h1 className="mt-4 text-3xl font-bold md:text-5xl">
                Välkommen Johan
            </h1>
            <h2 className="mt-4 text-2xl font-semibold italic md:text-4xl">
                Rooms
            </h2>
            <SectionContainer>
                <RoomForm onSuccess={handleRoomCreated} />
            </SectionContainer>
            <SectionContainer>
                <RoomsList refreshKey={refreshKey} />
            </SectionContainer>
            <h2 className="mt-4 text-2xl font-semibold italic md:text-4xl">
                Users
            </h2>
            <SectionContainer>
                <UsersList />
            </SectionContainer>
        </OuterContainer>
    )
}

export default Admin
