import { Outlet } from "react-router-dom";
import Header from "../components/core/Header";
import Footer from "../components/core/Footer";


export const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen font-default text-letter dark:text-letter-dark">
        <Header/>
            <main className="flex-1 overflow-y-auto bg-background dark:bg-background-dark ">
                <Outlet/>
            </main>
        <Footer/>
    </div>
  )
}
