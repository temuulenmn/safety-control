import React, { Suspense } from 'react'
import { Route, Routes, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  CSidebar, CSidebarBrand, CSidebarHeader, CSidebarNav, CSidebarFooter, CSidebarToggler,
  CNavItem, CNavTitle, CContainer, CSpinner,
  CHeader, CHeaderNav, CHeaderToggler, CDropdown, CDropdownToggle,
  CDropdownMenu, CDropdownItem, CDropdownDivider, CAvatar,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer, cilBuilding, cilPeople, cilAccountLogout, cilMenu,
  cilLayers, cilCart, cilUserPlus, cilEducation, cilClipboard,
} from '@coreui/icons'

const Dashboard       = React.lazy(() => import('./views/dashboard/Dashboard'))
const Companies       = React.lazy(() => import('./views/companies/Companies'))
const Users           = React.lazy(() => import('./views/users/Users'))
const RegisterUser    = React.lazy(() => import('./views/users/RegisterUser'))
const MarketItems     = React.lazy(() => import('./views/marketplace/Items'))
const MarketOrders    = React.lazy(() => import('./views/marketplace/Orders'))
const TrainingCatalog = React.lazy(() => import('./views/training/Catalog'))
const TrainingOrders  = React.lazy(() => import('./views/training/Orders'))

export default function Layout() {
  const dispatch   = useDispatch()
  const navigate   = useNavigate()
  const show       = useSelector(s => s.sidebarShow)
  const user       = useSelector(s => s.user)

  const logout = () => {
    dispatch({ type: 'logout' })
    navigate('/login')
  }

  return (
    <div className="wrapper d-flex flex-column min-vh-100">
      <CSidebar colorScheme="dark" position="fixed" visible={show}
        onVisibleChange={v => dispatch({ type: 'set', sidebarShow: v })}>
        <CSidebarHeader className="border-bottom">
          <CSidebarBrand className="text-white fw-bold fs-5">
            ⚙ System Admin
          </CSidebarBrand>
        </CSidebarHeader>
        <CSidebarNav>
          <CNavTitle>Удирдлага</CNavTitle>
          <CNavItem>
            <NavLink to="/dashboard" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilSpeedometer} customClassName="nav-icon" /> Хянах самбар
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/companies" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilBuilding} customClassName="nav-icon" /> Компаниуд
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/users" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilPeople} customClassName="nav-icon" /> Бүх хэрэглэгчид
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/users/register" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilUserPlus} customClassName="nav-icon" /> Хэрэглэгч бүртгэх
            </NavLink>
          </CNavItem>
          <CNavTitle>Маркетплейс</CNavTitle>
          <CNavItem>
            <NavLink to="/marketplace/items" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilLayers} customClassName="nav-icon" /> Барааны каталог
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/marketplace/orders" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilCart} customClassName="nav-icon" /> Захиалгууд
            </NavLink>
          </CNavItem>
          <CNavTitle>Сургалт</CNavTitle>
          <CNavItem>
            <NavLink to="/training/catalog" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilEducation} customClassName="nav-icon" /> Сургалтын каталог
            </NavLink>
          </CNavItem>
          <CNavItem>
            <NavLink to="/training/orders" className={({isActive}) => 'nav-link' + (isActive ? ' active' : '')}>
              <CIcon icon={cilClipboard} customClassName="nav-icon" /> Сургалтын захиалга
            </NavLink>
          </CNavItem>
        </CSidebarNav>
        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !show })} />
        </CSidebarFooter>
      </CSidebar>

      <div className="body flex-grow-1" style={{ marginLeft: 256 }}>
        <CHeader position="sticky" className="mb-4 p-0 border-bottom">
          <CContainer fluid className="border-bottom px-4" style={{ minHeight: 56 }}>
            <CHeaderToggler onClick={() => dispatch({ type: 'set', sidebarShow: !show })} style={{ marginInlineStart: '-14px' }}>
              <CIcon icon={cilMenu} size="lg" />
            </CHeaderToggler>
            <div className="ms-auto text-medium-emphasis small me-2">
              Super Admin
            </div>
            <CDropdown variant="nav-item">
              <CDropdownToggle caret={false} className="py-0 pe-0">
                <CAvatar color="danger" textColor="white" size="md">S</CAvatar>
              </CDropdownToggle>
              <CDropdownMenu placement="bottom-end">
                <CDropdownItem className="fw-semibold text-medium-emphasis">
                  {user?.username || 'superadmin'}
                </CDropdownItem>
                <CDropdownDivider />
                <CDropdownItem onClick={logout} style={{ cursor: 'pointer' }}>
                  <CIcon icon={cilAccountLogout} className="me-2" /> Гарах
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CContainer>
        </CHeader>

        <CContainer fluid className="px-4 pb-4">
          <Suspense fallback={<div className="py-5 text-center"><CSpinner /></div>}>
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/users"            element={<Users />} />
              <Route path="/users/register"   element={<RegisterUser />} />
              <Route path="/marketplace/items"  element={<MarketItems />} />
              <Route path="/marketplace/orders" element={<MarketOrders />} />
              <Route path="/training/catalog"   element={<TrainingCatalog />} />
              <Route path="/training/orders"    element={<TrainingOrders />} />
            </Routes>
          </Suspense>
        </CContainer>
      </div>
    </div>
  )
}
