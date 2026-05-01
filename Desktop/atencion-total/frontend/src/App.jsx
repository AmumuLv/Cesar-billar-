
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

export default function App(){
 return (
  <BrowserRouter>
   <nav className="bg-blue-700 text-white p-4 flex justify-between">
    <h1 className="font-bold">Atención Total</h1>
    <div>
      <Link to="/" className="mr-4">Inicio</Link>
      <Link to="/dashboard">Portal</Link>
    </div>
   </nav>

   <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/dashboard" element={<Dashboard/>}/>
   </Routes>
  </BrowserRouter>
 )
}
