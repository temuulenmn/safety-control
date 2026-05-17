import React, { useEffect, useState } from 'react'
import {
  CButton, CCard, CCardBody, CCardHeader, CBadge, CSpinner, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormSelect, CFormTextarea, CFormCheck,
} from '@coreui/react'
import api from 'src/services/api'

const EMPTY = {
  title:'', category:'', description:'', duration_hours:8, validity_months:12,
  mode:'classroom', price_per_person:0, min_participants:1, max_participants:'',
  image_url:'', is_mandatory:false, is_active:true,
}
const MODES = ['classroom','online','on_site','toolbox']
const fmt = n => Number(n||0).toLocaleString('mn-MN') + '₮'

export default function TrainingCatalog() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    api.getTrainingCatalog({ search: search || undefined, limit: 200 })
      .then(r => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit = (r) => {
    setEditing(r.id)
    setForm({
      title:r.title, category:r.category||'', description:r.description||'',
      duration_hours:r.duration_hours, validity_months:r.validity_months,
      mode:r.mode||'classroom', price_per_person:r.price_per_person||0,
      min_participants:r.min_participants||1,
      max_participants:r.max_participants||'',
      image_url:r.image_url||'',
      is_mandatory:r.is_mandatory, is_active:r.is_active,
    })
    setModal(true)
  }
  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        duration_hours: Number(form.duration_hours),
        validity_months: Number(form.validity_months),
        price_per_person: Number(form.price_per_person),
        min_participants: Number(form.min_participants),
        max_participants: form.max_participants ? Number(form.max_participants) : null,
      }
      editing ? await api.updateTrainingCatalog(editing, payload) : await api.createTrainingCatalog(payload)
      setModal(false); load()
    } finally { setSaving(false) }
  }
  const remove = async (id) => {
    if (!window.confirm('Устгах уу?')) return
    await api.deleteTrainingCatalog(id); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Сургалтын каталог</h4>
        <CButton color="primary" onClick={openCreate}>+ Сургалт нэмэх</CButton>
      </div>

      <CCard>
        <CCardHeader>
          <CRow className="g-2">
            <CCol sm={4}>
              <CFormInput placeholder="Хайх..." value={search}
                onChange={e=>setSearch(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&load()} />
            </CCol>
            <CCol sm={2}><CButton color="secondary" variant="outline" onClick={load}>Хайх</CButton></CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-0">
          {loading ? <div className="py-4 text-center"><CSpinner /></div> : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Нэр</CTableHeaderCell>
                  <CTableHeaderCell>Ангилал</CTableHeaderCell>
                  <CTableHeaderCell>Цаг</CTableHeaderCell>
                  <CTableHeaderCell>Хүчинтэй</CTableHeaderCell>
                  <CTableHeaderCell>Хэлбэр</CTableHeaderCell>
                  <CTableHeaderCell>Нэг хүн</CTableHeaderCell>
                  <CTableHeaderCell>Заавал</CTableHeaderCell>
                  <CTableHeaderCell>Статус</CTableHeaderCell>
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map(r => (
                  <CTableRow key={r.id}>
                    <CTableDataCell>
                      <div className="fw-semibold">{r.title}</div>
                      {r.description && <small className="text-medium-emphasis">{r.description.slice(0,60)}…</small>}
                    </CTableDataCell>
                    <CTableDataCell>{r.category||'—'}</CTableDataCell>
                    <CTableDataCell>{r.duration_hours}ц</CTableDataCell>
                    <CTableDataCell>{r.validity_months} сар</CTableDataCell>
                    <CTableDataCell>{r.mode||'—'}</CTableDataCell>
                    <CTableDataCell className="fw-semibold">{fmt(r.price_per_person)}</CTableDataCell>
                    <CTableDataCell>{r.is_mandatory && <CBadge color="danger">Заавал</CBadge>}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={r.is_active?'success':'secondary'}>{r.is_active?'Идэвхтэй':'Хаагдсан'}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="primary" variant="outline" className="me-1" onClick={()=>openEdit(r)}>Засах</CButton>
                      <CButton size="sm" color="danger" variant="outline" onClick={()=>remove(r.id)}>X</CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {rows.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center text-medium-emphasis py-4">
                      Сургалт алга
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={modal} onClose={()=>setModal(false)} size="lg">
        <CModalHeader><CModalTitle>{editing?'Сургалт засах':'Сургалт нэмэх'}</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm><CRow className="g-3">
            <CCol sm={8}><CFormLabel>Нэр *</CFormLabel>
              <CFormInput value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></CCol>
            <CCol sm={4}><CFormLabel>Ангилал</CFormLabel>
              <CFormInput value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}
                placeholder="Үндсэн, Тусгай, Мэргэжлийн..." /></CCol>
            <CCol sm={12}><CFormLabel>Тайлбар</CFormLabel>
              <CFormTextarea rows={2} value={form.description}
                onChange={e=>setForm(f=>({...f,description:e.target.value}))} /></CCol>
            <CCol sm={3}><CFormLabel>Үргэлжлэх цаг</CFormLabel>
              <CFormInput type="number" value={form.duration_hours}
                onChange={e=>setForm(f=>({...f,duration_hours:e.target.value}))} /></CCol>
            <CCol sm={3}><CFormLabel>Хүчинтэй сар</CFormLabel>
              <CFormInput type="number" value={form.validity_months}
                onChange={e=>setForm(f=>({...f,validity_months:e.target.value}))} /></CCol>
            <CCol sm={3}><CFormLabel>Хэлбэр</CFormLabel>
              <CFormSelect value={form.mode} onChange={e=>setForm(f=>({...f,mode:e.target.value}))}>
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </CFormSelect></CCol>
            <CCol sm={3}><CFormLabel>Нэг хүн ₮</CFormLabel>
              <CFormInput type="number" value={form.price_per_person}
                onChange={e=>setForm(f=>({...f,price_per_person:e.target.value}))} /></CCol>
            <CCol sm={3}><CFormLabel>Доод тоо</CFormLabel>
              <CFormInput type="number" value={form.min_participants}
                onChange={e=>setForm(f=>({...f,min_participants:e.target.value}))} /></CCol>
            <CCol sm={3}><CFormLabel>Дээд тоо</CFormLabel>
              <CFormInput type="number" value={form.max_participants}
                onChange={e=>setForm(f=>({...f,max_participants:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>Зургийн URL</CFormLabel>
              <CFormInput value={form.image_url} onChange={e=>setForm(f=>({...f,image_url:e.target.value}))} /></CCol>
            <CCol sm={6}>
              <CFormCheck label="Заавал сургалт" checked={form.is_mandatory}
                onChange={e=>setForm(f=>({...f,is_mandatory:e.target.checked}))} />
            </CCol>
            <CCol sm={6}>
              <CFormCheck label="Идэвхтэй (каталогт харагдана)" checked={form.is_active}
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
