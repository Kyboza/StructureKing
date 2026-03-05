import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
import Header from "../components/core/Header";
import Footer from "../components/core/Footer";
import BookingNotifications from "@/components/core/BookingNotifications";


export const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full font-default text-letter dark:text-letter-dark">
        <Header/>
        <Toaster position="bottom-right" expand visibleToasts={4}/>
        <BookingNotifications/>
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background dark:bg-background-dark ">
                <Outlet/>
            </main>
        <Footer/>
    </div>
  )
}
