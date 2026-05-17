import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CBadge, CSpinner, CFormInput, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CButton, CFormLabel,
} from '@coreui/react'
import api from 'src/services/api'
import dayjs from 'dayjs'

export default function Users() {
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [pwModal,  setPwModal]  = useState(false)
  const [pwUid,    setPwUid]    = useState(null)
  const [pwVal,    setPwVal]    = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [actioning,setActioning]= useState(null)

  const load = () => {
    setLoading(true)
    api.getAllUsers().then(r => setUsers(r.data||[])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggleUser = async (uid) => {
    setActioning(uid)
    try { await api.toggleUser(uid); load() } finally { setActioning(null) }
  }

  const openPw = (uid) => { setPwUid(uid); setPwVal(''); setPwModal(true) }
  const savePw = async () => {
    setPwSaving(true)
    try { await api.resetPassword(pwUid, { password: pwVal }); setPwModal(false) }
    finally { setPwSaving(false) }
  }

  const filtered = users.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h4 className="fw-bold mb-3">Бүх хэрэглэгчид</h4>

      <CCard>
        <CCardBody>
          <CRow className="mb-3">
            <CCol sm={4}>
              <CFormInput
                placeholder="Хайх — нэр, компани, и-мэйл..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </CCol>
            <CCol className="text-end text-medium-emphasis small d-flex align-items-center justify-content-end">
              Нийт: {filtered.length}
            </CCol>
          </CRow>

          {loading ? <div className="py-4 text-center"><CSpinner /></div> : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Хэрэглэгч</CTableHeaderCell>
                  <CTableHeaderCell>Компани</CTableHeaderCell>
                  <CTableHeaderCell>Роль</CTableHeaderCell>
                  <CTableHeaderCell>Сүүлийн нэвтрэлт</CTableHeaderCell>
                  <CTableHeaderCell>Бүртгэгдсэн</CTableHeaderCell>
                  <CTableHeaderCell>Статус</CTableHeaderCell>
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filtered.map(u => (
                  <CTableRow key={u.id}>
                    <CTableDataCell>
                      <div className="fw-semibold">{u.username}</div>
                      <small className="text-medium-emphasis">{u.email||'—'}</small>
                    </CTableDataCell>
                    <CTableDataCell>{u.company_name||'—'}</CTableDataCell>
                    <CTableDataCell><CBadge color="info">{u.role}</CBadge></CTableDataCell>
                    <CTableDataCell>
                      {u.last_login ? dayjs(u.last_login).format('YYYY-MM-DD HH:mm') : '—'}
                    </CTableDataCell>
                    <CTableDataCell>{dayjs(u.created_at).format('YYYY-MM-DD')}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={u.is_active ? 'success' : 'secondary'}>
                        {u.is_active ? 'Идэвхтэй' : 'Хаагдсан'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="warning" variant="outline" className="me-1"
                        onClick={() => openPw(u.id)}>Нууц үг</CButton>
                      <CButton size="sm" color={u.is_active ? 'danger' : 'success'} variant="outline"
                        disabled={actioning === u.id} onClick={() => toggleUser(u.id)}>
                        {actioning === u.id ? <CSpinner size="sm" /> : u.is_active ? 'Хаах' : 'Нээх'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {filtered.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={7} className="text-center text-medium-emphasis py-4">
                      Хэрэглэгч олдсонгүй
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={pwModal} onClose={() => setPwModal(false)}>
        <CModalHeader><CModalTitle>Нууц үг шинэчлэх</CModalTitle></CModalHeader>
        <CModalBody>
          <CFormLabel>Шинэ нууц үг</CFormLabel>
          <CFormInput type="password" value={pwVal} onChange={e => setPwVal(e.target.value)} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPwModal(false)}>Болих</CButton>
          <CButton color="warning" onClick={savePw} disabled={pwSaving || !pwVal}>
            {pwSaving ? <CSpinner size="sm" /> : 'Шинэчлэх'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
