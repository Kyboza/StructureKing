import { Routes, Route } from "react-router-dom"
import { AppLayout } from "./layouts/AppLayout"

import Home from "./components/routes/Home"
import Dashboard from "./components/routes/Dashboard"
import Admin from "./components/routes/Admin"

function App() {

  return (
   <Routes>
      <Route path="/" element={<AppLayout />}>
          <Route index element={<Home/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/admin" element={<Admin/>}/>
      </Route>
   </Routes>
  )
}

export default App
