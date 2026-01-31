
import { Routes, Route } from 'react-router-dom'
import { Login } from "./Login/Login.jsx"
import Dashboard from './Dashboard/Pages.jsx'
import ProtectedRoute from './Protected.route.jsx'

function App() {
  return (
   <Routes>
          <Route path="/" element={<Login />} />
                    <Route path="/Main" element={
                      <ProtectedRoute>
                         <Dashboard />
                      </ProtectedRoute>
                     } />

        </Routes>
  )
}

export default App
