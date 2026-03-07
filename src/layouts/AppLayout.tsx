import { Outlet } from 'react-router-dom'

import Footer from '@/frontend/components/core/Footer'
import Header from '@/frontend/components/core/Header'

import BookingNotifications from '@/frontend/components/core/BookingNotifications'
import { Toaster } from '@/frontend/components/ui/sonner'

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
