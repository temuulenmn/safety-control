import React, { useEffect, useState } from 'react'
import {
  CButton, CCard, CCardBody, CCardHeader, CBadge, CSpinner, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
  CForm, CFormInput, CFormLabel, CFormTextarea, CFormCheck,
} from '@coreui/react'
import api from 'src/services/api'

const EMPTY = {
  name: '', category: '', description: '', image_url: '',
  unit_price: 0, sizes_text: '', in_stock: 0, is_active: true,
}

const fmtMNT = (n) => Number(n||0).toLocaleString('mn-MN') + '₮'

export default function Items() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(false)
  const [form,    setForm]    = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)

  const load = () => {
    setLoading(true)
    api.getMarketItems({ search: search || undefined, limit: 200 })
      .then(r => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true) }
  const openEdit   = (r) => {
    setEditing(r.id)
    setForm({
      name: r.name, category: r.category||'', description: r.description||'',
      image_url: r.image_url||'', unit_price: r.unit_price||0,
      sizes_text: (r.sizes||[]).join(','), in_stock: r.in_stock||0,
      is_active: r.is_active,
    })
    setModal(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        sizes: form.sizes_text.split(',').map(s => s.trim()).filter(Boolean),
        unit_price: Number(form.unit_price),
        in_stock:   Number(form.in_stock),
      }
      delete payload.sizes_text
      editing ? await api.updateMarketItem(editing, payload) : await api.createMarketItem(payload)
      setModal(false); load()
    } finally { setSaving(false) }
  }

  const remove = async (id) => {
    if (!window.confirm('Устгах уу?')) return
    await api.deleteMarketItem(id); load()
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Барааны каталог</h4>
        <CButton color="primary" onClick={openCreate}>+ Бараа нэмэх</CButton>
      </div>

      <CCard>
        <CCardHeader>
          <CRow className="g-2">
            <CCol sm={4}>
              <CFormInput placeholder="Хайх — нэр, ангилал..." value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load()} />
            </CCol>
            <CCol sm={2}><CButton color="secondary" variant="outline" onClick={load}>Хайх</CButton></CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-0">
          {loading ? <div className="py-4 text-center"><CSpinner /></div> : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{width:60}}></CTableHeaderCell>
                  <CTableHeaderCell>Нэр</CTableHeaderCell>
                  <CTableHeaderCell>Ангилал</CTableHeaderCell>
                  <CTableHeaderCell>Үнэ</CTableHeaderCell>
                  <CTableHeaderCell>Хэмжээ</CTableHeaderCell>
                  <CTableHeaderCell>Үлдэгдэл</CTableHeaderCell>
                  <CTableHeaderCell>Статус</CTableHeaderCell>
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map(r => (
                  <CTableRow key={r.id}>
                    <CTableDataCell>
                      {r.image_url ? <img src={r.image_url} alt="" style={{width:40,height:40,objectFit:'cover',borderRadius:4}} />
                        : <div style={{width:40,height:40,background:'#e9ecef',borderRadius:4}}/>}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold">{r.name}</div>
                      <small className="text-medium-emphasis">{r.description?.slice(0,50)}</small>
                    </CTableDataCell>
                    <CTableDataCell>{r.category||'—'}</CTableDataCell>
                    <CTableDataCell className="fw-semibold">{fmtMNT(r.unit_price)}</CTableDataCell>
                    <CTableDataCell>{(r.sizes||[]).join(', ')||'—'}</CTableDataCell>
                    <CTableDataCell>{r.in_stock}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={r.is_active ? 'success' : 'secondary'}>
                        {r.is_active ? 'Идэвхтэй' : 'Хаагдсан'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton size="sm" color="primary" variant="outline" className="me-1" onClick={() => openEdit(r)}>Засах</CButton>
                      <CButton size="sm" color="danger" variant="outline" onClick={() => remove(r.id)}>X</CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {rows.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={8} className="text-center text-medium-emphasis py-4">
                      Бараа алга
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={modal} onClose={() => setModal(false)} size="lg">
        <CModalHeader><CModalTitle>{editing ? 'Бараа засах' : 'Бараа нэмэх'}</CModalTitle></CModalHeader>
        <CModalBody>
          <CForm><CRow className="g-3">
            <CCol sm={8}><CFormLabel>Нэр <span className="text-danger">*</span></CFormLabel>
              <CFormInput value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></CCol>
            <CCol sm={4}><CFormLabel>Ангилал</CFormLabel>
              <CFormInput value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}
                placeholder="хантааз, гутал..." /></CCol>
            <CCol sm={12}><CFormLabel>Тайлбар</CFormLabel>
              <CFormTextarea rows={2} value={form.description}
                onChange={e => setForm(f=>({...f,description:e.target.value}))} /></CCol>
            <CCol sm={12}><CFormLabel>Зургийн URL</CFormLabel>
              <CFormInput value={form.image_url} onChange={e => setForm(f=>({...f,image_url:e.target.value}))} /></CCol>
            <CCol sm={4}><CFormLabel>Үнэ (₮)</CFormLabel>
              <CFormInput type="number" value={form.unit_price}
                onChange={e => setForm(f=>({...f,unit_price:e.target.value}))} /></CCol>
            <CCol sm={4}><CFormLabel>Үлдэгдэл</CFormLabel>
              <CFormInput type="number" value={form.in_stock}
                onChange={e => setForm(f=>({...f,in_stock:e.target.value}))} /></CCol>
            <CCol sm={4}><CFormLabel>Хэмжээнүүд (таслалаар)</CFormLabel>
              <CFormInput value={form.sizes_text} onChange={e => setForm(f=>({...f,sizes_text:e.target.value}))}
                placeholder="S,M,L,XL" /></CCol>
            <CCol sm={12}>
              <CFormCheck checked={form.is_active} onChange={e => setForm(f=>({...f,is_active:e.target.checked}))}
                label="Идэвхтэй" />
            </CCol>
          </CRow></CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModal(false)}>Болих</CButton>
          <CButton color="primary" onClick={save} disabled={saving || !form.name}>
            {saving ? <CSpinner size="sm" /> : 'Хадгалах'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
