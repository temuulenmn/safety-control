import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CCard, CCardBody, CCol, CContainer, CRow, CForm, CFormInput,
  CFormLabel, CButton, CSpinner, CAlert,
} from '@coreui/react'
import api from 'src/services/api'

export default function Login() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await api.login(form)
      const { token, user } = r.data || {}
      if (user?.role !== 'super_admin') {
        setError('Системийн админ эрхгүй байна')
        return
      }
      dispatch({ type: 'login', token, user })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Нэвтрэх мэдээлэл буруу байна')
    } finally { setLoading(false) }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5} lg={4}>
            <CCard className="shadow-sm">
              <CCardBody className="p-4">
                <div className="text-center mb-4">
                  <div className="fs-1 mb-2">⚙</div>
                  <h4 className="fw-bold">System Admin</h4>
                  <p className="text-medium-emphasis small">Системийн удирдлага</p>
                </div>
                {error && <CAlert color="danger" className="py-2 small">{error}</CAlert>}
                <CForm onSubmit={submit}>
                  <div className="mb-3">
                    <CFormLabel>Хэрэглэгчийн нэр</CFormLabel>
                    <CFormInput
                      autoFocus
                      value={form.username}
                      onChange={e => setForm(f => ({...f, username: e.target.value}))}
                    />
                  </div>
                  <div className="mb-4">
                    <CFormLabel>Нууц үг</CFormLabel>
                    <CFormInput
                      type="password"
                      value={form.password}
                      onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    />
                  </div>
                  <CButton color="primary" type="submit" className="w-100" disabled={loading}>
                    {loading ? <CSpinner size="sm" /> : 'Нэвтрэх'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
