import { useState } from 'react'
import { Sidebar, type Page } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Services } from './pages/Services'
import { Logs } from './pages/Logs'
import { Settings, initTheme } from './pages/Settings'
import { useServices } from './hooks/useServices'
import { useServiceHistory } from './hooks/useServiceHistory'

initTheme()

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const {
    services,
    loading,
    refresh,
    startService,
    stopService,
    restartService,
    addService,
    deleteService
  } = useServices()

  const history = useServiceHistory(services)

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            services={services}
            history={history}
            onNavigate={setCurrentPage}
          />
        )
      case 'services':
        return (
          <Services
            services={services}
            loading={loading}
            onRefresh={refresh}
            onStart={startService}
            onStop={stopService}
            onRestart={restartService}
            onDelete={deleteService}
            onAdd={addService}
          />
        )
      case 'logs':
        return <Logs services={services} />
      case 'settings':
        return <Settings />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          max-height: 100vh;
        }
      `}</style>
    </div>
  )
}

export default App
