import React, { useEffect, useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CBadge, CSpinner, CButton, CRow, CCol,
  CForm, CFormInput, CFormLabel, CFormSelect, CAlert,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import api from 'src/services/api'
import dayjs from 'dayjs'

const EMPTY = { username:'', email:'', password:'', role:'admin' }

const ROLES = [
  { v:'admin',   l:'Админ — компанийн бүх эрх' },
  { v:'manager', l:'Менежер — хязгаарлагдмал эрх' },
  { v:'viewer',  l:'Үзэгч — зөвхөн харах' },
  { v:'staff',   l:'Ажилтан' },
]

export default function RegisterUser() {
  const [companies, setCompanies] = useState([])
  const [companyId, setCompanyId] = useState('')
  const [form,      setForm]      = useState(EMPTY)
  const [saving,    setSaving]    = useState(false)
  const [message,   setMessage]   = useState(null)
  const [error,     setError]     = useState(null)

  const [users,     setUsers]     = useState([])
  const [usersLoad, setUsersLoad] = useState(false)
  const [acting,    setActing]    = useState(null)

  // Reset password modal
  const [pwModal, setPwModal] = useState(false)
  const [pwUid,   setPwUid]   = useState(null)
  const [pwVal,   setPwVal]   = useState('')

  useEffect(() => {
    api.getCompanies().then(r => {
      const list = (r.data || []).filter(c => c.is_active)
      setCompanies(list)
      if (list[0]) setCompanyId(list[0].id)
    })
  }, [])

  useEffect(() => {
    if (!companyId) { setUsers([]); return }
    setUsersLoad(true)
    api.getCompanyUsers(companyId).then(r => setUsers(r.data || [])).finally(() => setUsersLoad(false))
  }, [companyId])

  const refresh = () => {
    if (!companyId) return
    api.getCompanyUsers(companyId).then(r => setUsers(r.data || []))
  }

  const save = async (e) => {
    e?.preventDefault()
    setError(null); setMessage(null)
    if (!companyId)      return setError('Компани сонгоно уу')
    if (!form.username)  return setError('Хэрэглэгчийн нэрийг бөглөнө үү')
    if (!form.password || form.password.length < 6) return setError('Нууц үг 6 тэмдэгтээс дээш байх ёстой')

    setSaving(true)
    try {
      const r = await api.createCompanyUser(companyId, form)
      setMessage(`✓ "${r.data.username}" хэрэглэгч амжилттай үүслээ`)
      setForm(EMPTY)
      refresh()
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа')
    } finally { setSaving(false) }
  }

  const toggle = async (uid) => {
    setActing(uid)
    try { await api.toggleUser(uid); refresh() }
    finally { setActing(null) }
  }

  const remove = async (uid, name) => {
    if (!window.confirm(`"${name}" хэрэглэгчийг бүрмөсөн устгах уу?`)) return
    setActing(uid)
    try { await api.deleteUser(uid); refresh() }
    finally { setActing(null) }
  }

  const openResetPw = (uid) => { setPwUid(uid); setPwVal(''); setPwModal(true) }
  const savePw = async () => {
    if (!pwVal || pwVal.length < 6) return
    try { await api.resetPassword(pwUid, { password: pwVal }); setPwModal(false) }
    catch (e) {}
  }

  const selectedCompany = companies.find(c => c.id === companyId)

  return (
    <div>
      <h4 className="fw-bold mb-3">Компанийн хэрэглэгч бүртгэх</h4>

      <CRow className="g-3">
        {/* ── Registration form ─────────────────────────────────── */}
        <CCol lg={5}>
          <CCard>
            <CCardHeader className="fw-semibold">Шинэ хэрэглэгч</CCardHeader>
            <CCardBody>
              <CForm onSubmit={save}>
                {message && <CAlert color="success" className="py-2 small">{message}</CAlert>}
                {error   && <CAlert color="danger"  className="py-2 small">{error}</CAlert>}

                <div className="mb-3">
                  <CFormLabel>Компани <span className="text-danger">*</span></CFormLabel>
                  <CFormSelect value={companyId} onChange={e => { setCompanyId(e.target.value); setMessage(null); setError(null) }}>
                    <option value="">-- Сонгох --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </CFormSelect>
                </div>

                <div className="mb-3">
                  <CFormLabel>Хэрэглэгчийн нэр <span className="text-danger">*</span></CFormLabel>
                  <CFormInput value={form.username}
                    onChange={e => setForm(f => ({...f, username: e.target.value}))}
                    placeholder="admin_xxx" />
                </div>

                <div className="mb-3">
                  <CFormLabel>И-мэйл</CFormLabel>
                  <CFormInput type="email" value={form.email}
                    onChange={e => setForm(f => ({...f, email: e.target.value}))}
                    placeholder="user@example.com" />
                </div>

                <div className="mb-3">
                  <CFormLabel>Нууц үг <span className="text-danger">*</span></CFormLabel>
                  <CFormInput type="text" value={form.password}
                    onChange={e => setForm(f => ({...f, password: e.target.value}))}
                    placeholder="хамгийн багадаа 6 тэмдэгт" />
                  <div className="form-text small">Хэрэглэгчид баталгаажуулалт явуулж нууц үгээ солихыг сануулна уу</div>
                </div>

                <div className="mb-3">
                  <CFormLabel>Роль</CFormLabel>
                  <CFormSelect value={form.role}
                    onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                    {ROLES.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
                  </CFormSelect>
                </div>

                <CButton type="submit" color="primary" className="w-100" disabled={saving}>
                  {saving ? <CSpinner size="sm" /> : 'Бүртгэх'}
                </CButton>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* ── Existing users for selected company ───────────────── */}
        <CCol lg={7}>
          <CCard>
            <CCardHeader className="fw-semibold d-flex justify-content-between align-items-center">
              <span>{selectedCompany ? `${selectedCompany.name} — хэрэглэгчид` : 'Хэрэглэгчид'}</span>
              <CBadge color="info">{users.length}</CBadge>
            </CCardHeader>
            <CCardBody className="p-0">
              {!companyId ? (
                <div className="text-center text-medium-emphasis py-4">Компани сонгоно уу</div>
              ) : usersLoad ? (
                <div className="text-center py-4"><CSpinner /></div>
              ) : (
                <CTable hover responsive className="mb-0">
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
                        <CTableDataCell className="small">
                          {u.last_login ? dayjs(u.last_login).format('YYYY-MM-DD HH:mm') : '—'}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={u.is_active ? 'success' : 'secondary'}>
                            {u.is_active ? 'Идэвхтэй' : 'Хаагдсан'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CButton size="sm" color="warning" variant="outline" className="me-1"
                            onClick={() => openResetPw(u.id)} disabled={acting === u.id}>
                            🔑
                          </CButton>
                          <CButton size="sm" color={u.is_active ? 'secondary' : 'success'} variant="outline" className="me-1"
                            onClick={() => toggle(u.id)} disabled={acting === u.id}>
                            {u.is_active ? 'Хаах' : 'Нээх'}
                          </CButton>
                          <CButton size="sm" color="danger" variant="outline"
                            onClick={() => remove(u.id, u.username)} disabled={acting === u.id}>
                            X
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {users.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan={5} className="text-center text-medium-emphasis py-4">
                          Хэрэглэгч алга. Зүүн талаас шинээр бүртгэнэ үү
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Reset password modal */}
      <CModal visible={pwModal} onClose={() => setPwModal(false)}>
        <CModalHeader><CModalTitle>Нууц үг шинэчлэх</CModalTitle></CModalHeader>
        <CModalBody>
          <CFormLabel>Шинэ нууц үг (хамгийн багадаа 6 тэмдэгт)</CFormLabel>
          <CFormInput type="text" value={pwVal} onChange={e => setPwVal(e.target.value)} />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setPwModal(false)}>Болих</CButton>
          <CButton color="warning" onClick={savePw} disabled={!pwVal || pwVal.length < 6}>
            Шинэчлэх
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
