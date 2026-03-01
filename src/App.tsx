import { Routes, Route } from "react-router-dom"
import { AppLayout } from "./layouts/AppLayout"

import Home from "./components/routes/Home"
import Dashboard from "./components/routes/Dashboard"

function App() {

  return (
   <Routes>
      <Route path="/" element={<AppLayout />}>
          <Route index element={<Home/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
      </Route>
   </Routes>
  )
}

export default App
