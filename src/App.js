import React, { Suspense } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'

const Layout   = React.lazy(() => import('./Layout'))
const Login    = React.lazy(() => import('./views/pages/Login'))

const Guard = ({ children }) => {
  const token = localStorage.getItem('sys_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="d-flex justify-content-center align-items-center vh-100"><CSpinner color="primary" /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<Guard><Layout /></Guard>} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
