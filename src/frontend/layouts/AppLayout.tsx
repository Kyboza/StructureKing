import { Outlet } from 'react-router-dom'

import BookingNotifications from '../components/core/BookingNotifications'
import Footer from '../components/core/Footer'
import Header from '../components/core/Header'
import { Toaster } from '../components/ui/sonner'


export const AppLayout = () => {
    return (
        <div className="font-default text-letter dark:text-letter-dark flex min-h-screen w-full flex-col">
            <Header />
            <Toaster position="bottom-right" expand visibleToasts={4} />
            <BookingNotifications />
            <main className="bg-background dark:bg-background-dark flex-1 overflow-x-hidden overflow-y-auto">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
