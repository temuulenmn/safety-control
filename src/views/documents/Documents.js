import React, { useEffect, useState } from 'react'
import {
  CButton, CCard, CCardBody, CCardHeader, CBadge, CSpinner, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CFormCheck,
} from '@coreui/react'
import api from 'src/services/api'

const CAT_LABEL = { norm:'Норм', regulation:'Дүрэм/Хууль', instruction:'Зааварчилгаа' }
const CAT_COLOR = { norm:'primary', regulation:'warning', instruction:'info' }
const EMPTY = {
  category:'instruction', work_type:'', title:'', doc_number:'',
  description:'', content:'', file_url:'', is_active:true,
}

export default function Documents() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [catF,    setCatF]    = useState('')
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    api.getDocuments({ search: search || undefined, category: catF || undefined, limit: 300 })
      .then(r => setRows(r.data || [])).finally(()=>setLoading(false))
  }
  useEffect(()=>{ load() }, [catF])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (r) => {
    setEditing(r.id)
    setForm({
      category:r.category, work_type:r.work_type||'', title:r.title,
      doc_number:r.doc_number||'', description:r.description||'',
      content:r.content||'', file_url:r.file_url||'', is_active:r.is_active,
    })
    setModal(true)
  }
  const save = async () => {
    setSaving(true)
    try {
      editing ? await api.updateDocument(editing, form) : await api.createDocument(form)
      setModal(false); load()
    } finally { setSaving(false) }
  }
  const remove = async (id) => {
    if (!window.confirm('Устгах уу?')) return
    await api.deleteDocument(id); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Норм дүрэм / Зааварчилгааны сан</h4>
        <CButton color="primary" onClick={openCreate}>+ Баримт нэмэх</CButton>
      </div>

      <CCard>
        <CCardHeader>
          <CRow className="g-2">
            <CCol sm={4}>
              <CFormInput placeholder="Хайх..." value={search}
                onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} />
            </CCol>
            <CCol sm={3}>
              <CFormSelect value={catF} onChange={e=>setCatF(e.target.value)}>
                <option value="">Бүх ангилал</option>
                {Object.entries(CAT_LABEL).map(([k,l]) => <option key={k} value={k}>{l}</option>)}
              </CFormSelect>
            </CCol>
            <CCol sm={2}><CButton color="secondary" variant="outline" onClick={load}>Хайх</CButton></CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-0">
          {loading ? <div className="py-4 text-center"><CSpinner /></div> : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Гарчиг</CTableHeaderCell>
                  <CTableHeaderCell>Ангилал</CTableHeaderCell>
                  <CTableHeaderCell>Ажлын төрөл</CTableHeaderCell>
                  <CTableHeaderCell>Дугаар</CTableHeaderCell>
                  <CTableHeaderCell>Статус</CTableHeaderCell>
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map(r => (
                  <CTableRow key={r.id}>
                    <CTableDataCell>
                      <div className="fw-semibold">{r.title}</div>
                      {r.description && <small className="text-medium-emphasis">{r.description.slice(0,60)}</small>}
                    </CTableDataCell>
                    <CTableDataCell><CBadge color={CAT_COLOR[r.category]}>{CAT_LABEL[r.category]}</CBadge></CTableDataCell>
                    <CTableDataCell>{r.work_type||'—'}</CTableDataCell>
                    <CTableDataCell>{r.doc_number||'—'}</CTableDataCell>
                    <CTableDataCell><CBadge color={r.is_active?'success':'secondary'}>{r.is_active?'Идэвхтэй':'Хаагдсан'}</CBadge></CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="primary" variant="outline" className="me-1" onClick={()=>openEdit(r)}>Засах</CButton>
                      <CButton size="sm" color="danger" variant="outline" onClick={()=>remove(r.id)}>X</CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {rows.length === 0 && (
                  <CTableRow><CTableDataCell colSpan={6} className="text-center text-medium-emphasis py-4">Баримт алга</CTableDataCell></CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={modal} onClose={()=>setModal(false)} size="lg" scrollable>
        <CModalHeader><CModalTitle>{editing?'Баримт засах':'Баримт нэмэх'}</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm><CRow className="g-3">
            <CCol sm={4}><CFormLabel>Ангилал *</CFormLabel>
              <CFormSelect value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {Object.entries(CAT_LABEL).map(([k,l]) => <option key={k} value={k}>{l}</option>)}
              </CFormSelect></CCol>
            <CCol sm={4}><CFormLabel>Ажлын төрөл</CFormLabel>
              <CFormInput value={form.work_type} onChange={e=>setForm(f=>({...f,work_type:e.target.value}))}
                placeholder="Арматур, Цутгалт..." /></CCol>
            <CCol sm={4}><CFormLabel>Баримтын дугаар</CFormLabel>
              <CFormInput value={form.doc_number} onChange={e=>setForm(f=>({...f,doc_number:e.target.value}))}
                placeholder="БНбД 12-..." /></CCol>
            <CCol sm={12}><CFormLabel>Гарчиг *</CFormLabel>
              <CFormInput value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>Товч тайлбар</CFormLabel>
              <CFormTextarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>Агуулга (текст)</CFormLabel>
              <CFormTextarea rows={6} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}
                placeholder="Зааварчилгааны бүрэн текст..." /></CCol>
            <CCol sm={12}><CFormLabel>Файлын холбоос (PDF URL)</CFormLabel>
              <CFormInput value={form.file_url} onChange={e=>setForm(f=>({...f,file_url:e.target.value}))} /></CCol>
            <CCol sm={12}>
              <CFormCheck label="Идэвхтэй (компаниудад харагдана)" checked={form.is_active}
                onChange={e=>setForm(f=>({...f,is_active:e.target.checked}))} />
            </CCol>
          </CRow></CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={()=>setModal(false)}>Болих</CButton>
          <CButton color="primary" onClick={save} disabled={saving || !form.title}>
            {saving ? <CSpinner size="sm" /> : 'Хадгалах'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
