import React, { useEffect, useState } from 'react'
import {
  CButton, CCard, CCardBody, CBadge, CSpinner, CRow, CCol,
  CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CFormSelect, CFormInput, CFormLabel, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
} from '@coreui/react'
import api from 'src/services/api'
import dayjs from 'dayjs'

const STATUS_COLOR = { pending:'warning', scheduled:'info', in_progress:'primary', completed:'success', cancelled:'secondary' }
const STATUS_LABEL = { pending:'Хүлээгдэж буй', scheduled:'Товлогдсон', in_progress:'Үргэлжилж буй', completed:'Дууссан', cancelled:'Цуцлагдсан' }
const fmt = n => Number(n||0).toLocaleString('mn-MN') + '₮'

export default function TrainingOrders() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [status,  setStatus]  = useState('')
  const [sched,   setSched]   = useState(null)  // {order, date, trainer, location}
  const [acting,  setActing]  = useState(null)

  const load = () => {
    setLoading(true)
    api.getTrainingOrders({ status: status || undefined, limit: 200 })
      .then(r => setRows(r.data || [])).finally(() => setLoading(false))
  }
  useEffect(load, [status])

  const openSchedule = (r) => setSched({ order:r, scheduled_date: dayjs().add(7,'day').format('YYYY-MM-DD'), trainer_name:'', location:'' })
  const doSchedule = async () => {
    setActing(sched.order.id)
    try {
      await api.scheduleTraining(sched.order.id, {
        scheduled_date: sched.scheduled_date, trainer_name: sched.trainer_name, location: sched.location,
      })
      setSched(null); load()
    } finally { setActing(null) }
  }
  const act = async (id, fn, msg) => {
    if (!window.confirm(msg)) return
    setActing(id)
    try { await fn(id); load() } finally { setActing(null) }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">Сургалтын захиалга</h4>
        <div style={{width:220}}>
          <CFormSelect value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Бүх төлөв</option>
            {Object.entries(STATUS_LABEL).map(([k,l]) => <option key={k} value={k}>{l}</option>)}
          </CFormSelect>
        </div>
      </div>

      <CCard>
        <CCardBody className="p-0">
          {loading ? <div className="py-4 text-center"><CSpinner /></div> : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>№</CTableHeaderCell>
                  <CTableHeaderCell>Компани</CTableHeaderCell>
                  <CTableHeaderCell>Сургалт</CTableHeaderCell>
                  <CTableHeaderCell>Хамрагдах</CTableHeaderCell>
                  <CTableHeaderCell>Дүн</CTableHeaderCell>
                  <CTableHeaderCell>Захиалсан</CTableHeaderCell>
                  <CTableHeaderCell>Товлогдсон</CTableHeaderCell>
                  <CTableHeaderCell>Төлөв</CTableHeaderCell>
                  <CTableHeaderCell></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map(r => (
                  <CTableRow key={r.id}>
                    <CTableDataCell><code>{r.order_number}</code></CTableDataCell>
                    <CTableDataCell className="fw-semibold">{r.company_name}</CTableDataCell>
                    <CTableDataCell>{r.title}</CTableDataCell>
                    <CTableDataCell>{r.participant_count} ажилтан</CTableDataCell>
                    <CTableDataCell className="fw-semibold">{fmt(r.total_amount)}</CTableDataCell>
                    <CTableDataCell className="small">{dayjs(r.ordered_at).format('YYYY-MM-DD')}</CTableDataCell>
                    <CTableDataCell className="small">{r.scheduled_date ? dayjs(r.scheduled_date).format('YYYY-MM-DD') : '—'}</CTableDataCell>
                    <CTableDataCell><CBadge color={STATUS_COLOR[r.status]}>{STATUS_LABEL[r.status]}</CBadge></CTableDataCell>
                    <CTableDataCell>
                      {r.status === 'pending' && (
                        <CButton size="sm" color="info" variant="outline" disabled={acting===r.id} onClick={()=>openSchedule(r)}>Товлох</CButton>
                      )}
                      {r.status === 'scheduled' && (
                        <CButton size="sm" color="primary" variant="outline" disabled={acting===r.id}
                          onClick={()=>act(r.id, api.startTraining, 'Сургалтыг эхлүүлсэн гэж тэмдэглэх үү?')}>Эхлүүлэх</CButton>
                      )}
                      {r.status === 'in_progress' && (
                        <CButton size="sm" color="success" variant="outline" disabled={acting===r.id}
                          onClick={()=>act(r.id, api.completeTraining, 'Сургалт дууссан уу?')}>Дуусгах</CButton>
                      )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
                {rows.length === 0 && (
                  <CTableRow>
                    <CTableDataCell colSpan={9} className="text-center text-medium-emphasis py-4">Захиалга алга</CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={!!sched} onClose={()=>setSched(null)}>
        <CModalHeader><CModalTitle>Сургалтыг товлох</CModalTitle></CModalHeader>
        <CModalBody>
          {sched && (<>
            <p className="mb-3">
              <strong>{sched.order.title}</strong><br/>
              <small className="text-medium-emphasis">{sched.order.company_name} — {sched.order.participant_count} ажилтан</small>
            </p>
            <CRow className="g-3">
              <CCol sm={6}><CFormLabel>Товлосон огноо *</CFormLabel>
                <CFormInput type="date" value={sched.scheduled_date}
                  onChange={e=>setSched(s=>({...s,scheduled_date:e.target.value}))} /></CCol>
              <CCol sm={6}><CFormLabel>Багш</CFormLabel>
                <CFormInput value={sched.trainer_name}
                  onChange={e=>setSched(s=>({...s,trainer_name:e.target.value}))} /></CCol>
              <CCol sm={12}><CFormLabel>Байршил</CFormLabel>
                <CFormInput value={sched.location}
                  onChange={e=>setSched(s=>({...s,location:e.target.value}))} /></CCol>
            </CRow>
          </>)}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={()=>setSched(null)}>Болих</CButton>
          <CButton color="info" onClick={doSchedule} disabled={!sched?.scheduled_date}>Товлох</CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}
