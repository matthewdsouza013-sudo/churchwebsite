import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import logo from './assets/logo.png'
import MassBookingForm from './pages/massBookingForm'
import MassStatus from './pages/MassStatus'
import AdminDash from './pages/AdminDash'
import AdminCertDash from './pages/AdminCertDash'
import CertificateStatus from './pages/certificateStatus'
import CertificateRequest from './pages/certificateRequest'
import Body from './components/body'
import Contact from './pages/Contact'
import Association from './pages/Association'
import Announcements from './pages/Announcements'
import Calendar from './pages/Calendar'
import Footer from './components/Footer'
const App = () => {
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <ToastContainer />

      {booting && (
        <div className="splash-overlay">
          <div className="splash-inner">
            <div className="splash-logo-wrap">
              <img src={logo} alt="Church logo" className="splash-logo" />
            </div>
            <div className="splash-dots" aria-hidden="true">
              <span className="splash-dot" />
              <span className="splash-dot" />
              <span className="splash-dot" />
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/massForm" element={<MassBookingForm/>} ></Route>
        <Route path="/status" element={<MassStatus/>} ></Route>
        <Route path='/admin-dash' element={<AdminDash/>}  ></Route>
        <Route path='/admin-certificate' element={<AdminCertDash/>}  ></Route>
        <Route path='/certificate-status' element={<CertificateStatus/>} ></Route>
        <Route path='/certificate-request' element={<CertificateRequest/>} ></Route>
        <Route path='/body' element={<Body/>} ></Route>
        <Route path='/contact' element={<Contact/>} ></Route>
        <Route path='/association' element={<Association/>} ></Route>
        <Route path='/announcements' element={<Announcements/>} ></Route>
        <Route path='/calendar' element={<Calendar/>} ></Route>
      </Routes>
      <Footer />
    </>
  )
}

export default App
