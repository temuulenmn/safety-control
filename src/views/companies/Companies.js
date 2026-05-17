import React, { useEffect, useState } from 'react'
import {
  CButton, CCard, CCardBody, CCardHeader, CBadge, CSpinner,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormSelect, CRow, CCol, CNav, CNavItem, CNavLink,
  CTabContent, CTabPane,
} from '@coreui/react'
import api from 'src/services/api'
import dayjs from 'dayjs'

const EMPTY_COMPANY = { name: '', industry: '', address: '', email: '', phone: '', register_number: '' }
const EMPTY_USER    = { username: '', email: '', password: '', role: 'admin' }

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [selected,  setSelected]  = useState(null)
  const [users,     setUsers]     = useState([])
  const [usersLoad, setUsersLoad] = useState(false)
  const [tab,       setTab]       = useState('info')

  // Company modal
  const [cModal,    setCModal]    = useState(false)
  const [cForm,     setCForm]     = useState(EMPTY_COMPANY)
  const [cEditing,  setCEditing]  = useState(null)
  const [cSaving,   setCSaving]   = useState(false)

  // User modal
  const [uModal,    setUModal]    = useState(false)
  const [uForm,     setUForm]     = useState(EMPTY_USER)
  const [uSaving,   setUSaving]   = useState(false)

  // Reset password modal
  const [pwModal,   setPwModal]   = useState(false)
  const [pwUid,     setPwUid]     = useState(null)
  const [pwVal,     setPwVal]     = useState('')
  const [pwSaving,  setPwSaving]  = useState(false)

  const [actioning, setActioning] = useState(null)

  const load = () => {
    setLoading(true)
    api.getCompanies().then(r => setCompanies(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCompany = (c) => {
    setSelected(c); setTab('info')
    setUsersLoad(true)
    api.getCompanyUsers(c.id).then(r => setUsers(r.data || [])).finally(() => setUsersLoad(false))
  }

  const openCreate = () => { setCEditing(null); setCForm(EMPTY_COMPANY); setCModal(true) }
  const openEdit   = (c) => {
    setCEditing(c.id)
    setCForm({ name: c.name, industry: c.industry||'', address: c.address||'',
      email: c.email||'', phone: c.phone||'', register_number: c.register_number||'' })
    setCModal(true)
  }
  const saveCompany = async () => {
    setCSaving(true)
    try {
      if (cEditing) { await api.updateCompany(cEditing, cForm); load(); if (selected?.id === cEditing) openCompany({...selected, ...cForm}) }
      else { await api.createCompany(cForm); load() }
      setCModal(false)
    } finally { setCSaving(false) }
  }

  const toggle = async (id) => {
    setActioning(id)
    try { await api.toggleCompany(id); load(); if (selected?.id === id) setSelected(s => ({...s, is_active: !s.is_active})) }
    finally { setActioning(null) }
  }

  const saveUser = async () => {
    setUSaving(true)
    try { await api.createCompanyUser(selected.id, uForm); setUModal(false); api.getCompanyUsers(selected.id).then(r => setUsers(r.data||[])) }
    finally { setUSaving(false) }
  }

  const toggleUser = async (uid) => {
    await api.toggleUser(uid)
    api.getCompanyUsers(selected.id).then(r => setUsers(r.data||[]))
  }

  const openResetPw = (uid) => { setPwUid(uid); setPwVal(''); setPwModal(true) }
  const savePw = async () => {
    setPwSaving(true)
    try { await api.resetPassword(pwUid, { password: pwVal }); setPwModal(false) }
    finally { setPwSaving(false) }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Компаниуд</h4>
        <CButton color="primary" onClick={openCreate}>+ Компани нэмэх</CButton>
      </div>

      <CRow className="g-3">
        {/* List */}
        <CCol lg={selected ? 5 : 12}>
          <CCard>
            <CCardBody className="p-0">
              {loading ? <div className="py-4 text-center"><CSpinner /></div> : (
                <CTable hover responsive className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Компани</CTableHeaderCell>
                      <CTableHeaderCell>Салбар</CTableHeaderCell>
                      <CTableHeaderCell>Ажилтан</CTableHeaderCell>
                      <CTableHeaderCell>Статус</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {companies.map(c => (
                      <CTableRow key={c.id} active={selected?.id === c.id}
                        onClick={() => openCompany(c)} style={{ cursor: 'pointer' }}>
                        <CTableDataCell>
                          <div className="fw-semibold">{c.name}</div>
                          <small className="text-medium-emphasis">{c.industry||'—'}</small>
                        </CTableDataCell>
                        <CTableDataCell>{c.industry||'—'}</CTableDataCell>
                        <CTableDataCell>{c.employee_count}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={c.is_active ? 'success' : 'danger'}>
                            {c.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell onClick={e => e.stopPropagation()}>
                          <CButton size="sm" color="primary" variant="outline" className="me-1" onClick={() => openEdit(c)}>Засах</CButton>
                          <CButton size="sm" color={c.is_active ? 'warning' : 'success'} variant="outline"
                            disabled={actioning === c.id} onClick={() => toggle(c.id)}>
                            {actioning === c.id ? <CSpinner size="sm" /> : c.is_active ? 'Зогсоох' : 'Идэвхжүүлэх'}
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Detail panel */}
        {selected && (
          <CCol lg={7}>
            <CCard>
              <CCardHeader className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{selected.name}</span>
                <CButton size="sm" color="secondary" variant="outline" onClick={() => setSelected(null)}>✕</CButton>
              </CCardHeader>
              <CCardBody>
                <CNav variant="tabs" className="mb-3">
                  {[['info','Мэдээлэл'],['users','Хэрэглэгчид']].map(([k,l]) => (
                    <CNavItem key={k}>
                      <CNavLink active={tab===k} onClick={() => setTab(k)} style={{cursor:'pointer'}}>{l}</CNavLink>
                    </CNavItem>
                  ))}
                </CNav>
                <CTabContent>
                  <CTabPane visible={tab==='info'}>
                    <CTable small borderless>
                      <CTableBody>
                        {[
                          ['Нэр', selected.name],
                          ['Регистр', selected.register_number||'—'],
                          ['Салбар', selected.industry||'—'],
                          ['Хаяг', selected.address||'—'],
                          ['И-мэйл', selected.email||'—'],
                          ['Утас', selected.phone||'—'],
                          ['Ажилтны тоо', selected.employee_count],
                          ['Хэрэглэгч тоо', selected.user_count],
                          ['Бүртгэгдсэн', selected.created_at ? dayjs(selected.created_at).format('YYYY-MM-DD') : '—'],
                        ].map(([l,v]) => (
                          <CTableRow key={l}>
                            <CTableDataCell className="text-medium-emphasis" style={{width:160}}>{l}</CTableDataCell>
                            <CTableDataCell className="fw-semibold">{v}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </CTabPane>

                  <CTabPane visible={tab==='users'}>
                    <div className="d-flex justify-content-end mb-2">
                      <CButton size="sm" color="primary" onClick={() => { setUForm(EMPTY_USER); setUModal(true) }}>
                        + Admin нэмэх
                      </CButton>
                    </div>
                    {usersLoad ? <div className="py-3 text-center"><CSpinner /></div> : (
                      <CTable hover responsive small>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell>Хэрэглэгч</CTableHeaderCell>
                            <CTableHeaderCell>Роль</CTableHeaderCell>
                            <CTableHeaderCell>Сүүлийн нэвтрэлт</CTableHeaderCell>
                            <CTableHeaderCell>Статус</CTableHeaderCell>
                            <CTableHeaderCell></CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {users.map(u => (
                            <CTableRow key={u.id}>
                              <CTableDataCell>
                                <div className="fw-semibold">{u.username}</div>
                                <small className="text-medium-emphasis">{u.email||'—'}</small>
                              </CTableDataCell>
                              <CTableDataCell><CBadge color="info">{u.role}</CBadge></CTableDataCell>
                              <CTableDataCell>{u.last_login ? dayjs(u.last_login).format('MM-DD HH:mm') : '—'}</CTableDataCell>
                              <CTableDataCell>
                                <CBadge color={u.is_active ? 'success' : 'secondary'}>
                                  {u.is_active ? 'Идэвхтэй' : 'Хаагдсан'}
                                </CBadge>
                              </CTableDataCell>
                              <CTableDataCell>
                                <CButton size="sm" color="warning" variant="outline" className="me-1"
                                  onClick={() => openResetPw(u.id)}>Нууц үг</CButton>
                                <CButton size="sm" color={u.is_active ? 'danger' : 'success'} variant="outline"
                                  onClick={() => toggleUser(u.id)}>
                                  {u.is_active ? 'Хаах' : 'Нээх'}
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))}
                          {users.length === 0 && (
                            <CTableRow>
                              <CTableDataCell colSpan={5} className="text-center text-medium-emphasis py-3">
                                Хэрэглэгч байхгүй
                              </CTableDataCell>
                            </CTableRow>
                          )}
                        </CTableBody>
                      </CTable>
                    )}
                  </CTabPane>
                </CTabContent>
              </CCardBody>
            </CCard>
          </CCol>
        )}
      </CRow>

      {/* Company modal */}
      <CModal visible={cModal} onClose={() => setCModal(false)}>
        <CModalHeader><CModalTitle>{cEditing ? 'Компани засах' : 'Компани нэмэх'}</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm><CRow className="g-3">
            <CCol sm={12}><CFormLabel>Нэр <span className="text-danger">*</span></CFormLabel>
              <CFormInput value={cForm.name} onChange={e => setCForm(f=>({...f,name:e.target.value}))} /></CCol>
            <CCol sm={6}><CFormLabel>Регистр</CFormLabel>
              <CFormInput value={cForm.register_number} onChange={e => setCForm(f=>({...f,register_number:e.target.value}))} /></CCol>
            <CCol sm={6}><CFormLabel>Салбар</CFormLabel>
              <CFormInput value={cForm.industry} onChange={e => setCForm(f=>({...f,industry:e.target.value}))} placeholder="mining, construction..." /></CCol>
            <CCol sm={12}><CFormLabel>Хаяг</CFormLabel>
              <CFormInput value={cForm.address} onChange={e => setCForm(f=>({...f,address:e.target.value}))} /></CCol>
            <CCol sm={6}><CFormLabel>И-мэйл</CFormLabel>
              <CFormInput type="email" value={cForm.email} onChange={e => setCForm(f=>({...f,email:e.target.value}))} /></CCol>
            <CCol sm={6}><CFormLabel>Утас</CFormLabel>
              <CFormInput value={cForm.phone} onChange={e => setCForm(f=>({...f,phone:e.target.value}))} /></CCol>
          </CRow></CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setCModal(false)}>Болих</CButton>
          <CButton color="primary" onClick={saveCompany} disabled={cSaving}>
            {cSaving ? <CSpinner size="sm" /> : 'Хадгалах'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Add user modal */}
      <CModal visible={uModal} onClose={() => setUModal(false)}>
        <CModalHeader><CModalTitle>Admin хэрэглэгч нэмэх</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm><CRow className="g-3">
            <CCol sm={12}><CFormLabel>Хэрэглэгчийн нэр <span className="text-danger">*</span></CFormLabel>
              <CFormInput value={uForm.username} onChange={e => setUForm(f=>({...f,username:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>И-мэйл</CFormLabel>
              <CFormInput type="email" value={uForm.email} onChange={e => setUForm(f=>({...f,email:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>Нууц үг <span className="text-danger">*</span></CFormLabel>
              <CFormInput type="password" value={uForm.password} onChange={e => setUForm(f=>({...f,password:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>Роль</CFormLabel>
              <CFormSelect value={uForm.role} onChange={e => setUForm(f=>({...f,role:e.target.value}))}>
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="viewer">viewer</option>
              </CFormSelect></CCol>
          </CRow></CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setUModal(false)}>Болих</CButton>
          <CButton color="primary" onClick={saveUser} disabled={uSaving}>
            {uSaving ? <CSpinner size="sm" /> : 'Үүсгэх'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Reset password modal */}
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
