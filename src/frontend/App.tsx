import { Route, Routes } from 'react-router-dom'

import Admin from './components/routes/Admin'
import Dashboard from './components/routes/Dashboard'
import Home from './components/routes/Home'
import NotFound from './components/routes/NotFound'
import { AppLayout } from './layouts/AppLayout'

function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}

export default App
