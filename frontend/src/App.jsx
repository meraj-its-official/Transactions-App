import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { SendMoney } from './pages/SendMoney'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Toaster } from 'react-hot-toast';
import { ForgetPassword } from './pages/ForgetPassword'

function App() {

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter >
        <Routes >
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/send' element={<SendMoney />} />
          <Route path='/forget' element={<ForgetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
