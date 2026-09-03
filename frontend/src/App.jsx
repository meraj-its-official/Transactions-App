import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from "./components/ProtectedRoute";
import './App.css'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { Toaster } from 'react-hot-toast';
import { ForgetPassword } from './pages/ForgetPassword'
import { useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'

function App() {
  // 1. Dedicated Token Checker Component
  function TokenExpirationChecker() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Agar token expire ho chuka hai
          if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            localStorage.clear();
            navigate("/signin");
          }
        } catch (err) {
          // Invalid/tampered token case
          localStorage.clear();
          navigate("/signin");
        }
      }
    }, [location.pathname]); // Har route change par trigger hoga

    return null; // UI par kuch render nahi karega
  }

  // 2. Main App Component
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <BrowserRouter >
        <TokenExpirationChecker />
        <Routes >
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/forget' element={<ForgetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
