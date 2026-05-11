import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout.jsx'
import ApiEditorPage from './pages/ApiEditorPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import WhyPage from './pages/WhyPage.jsx'
import GuidePage from './pages/GuidePage.jsx'
import TesterPage from './pages/TesterPage.jsx'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '16px',
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.18)',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/why" element={<WhyPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/apis/new" element={<ApiEditorPage mode="create" />} />
          <Route path="/apis/:id" element={<ApiEditorPage mode="edit" />} />
          <Route path="/tester" element={<TesterPage />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
