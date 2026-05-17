import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCol, CRow, CSpinner, CBadge } from '@coreui/react'
import api from 'src/services/api'

const StatCard = ({ title, value, sub, color = 'primary' }) => (
  <CCard className="h-100">
    <CCardBody className="d-flex flex-column justify-content-between">
      <div className="text-medium-emphasis small">{title}</div>
      <div className={`fw-bold fs-2 text-${color}`}>{value ?? <CSpinner size="sm" />}</div>
      {sub && <div className="text-medium-emphasis small">{sub}</div>}
    </CCardBody>
  </CCard>
)

export default function Dashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getOverview()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-5 text-center"><CSpinner /></div>

  return (
    <div>
      <h4 className="fw-bold mb-4">Хянах самбар</h4>
      <CRow className="g-3 mb-4">
        <CCol xs={6} lg={3}>
          <StatCard
            title="Нийт компани"
            value={data?.companies?.total}
            sub={`${data?.companies?.active} идэвхтэй`}
            color="primary"
          />
        </CCol>
        <CCol xs={6} lg={3}>
          <StatCard
            title="Идэвхгүй компани"
            value={data?.companies?.inactive}
            color="danger"
          />
        </CCol>
        <CCol xs={6} lg={3}>
          <StatCard
            title="Нийт хэрэглэгч"
            value={data?.users?.total}
            sub="компанийн adminууд"
            color="info"
          />
        </CCol>
        <CCol xs={6} lg={3}>
          <StatCard
            title="Нийт ажилтан"
            value={data?.employees?.total}
            sub="бүх компаниар"
            color="success"
          />
        </CCol>
      </CRow>
    </div>
  )
}
