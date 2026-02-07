import { useState } from 'react'
import { Header } from './components/Header'
import { ServiceList } from './components/ServiceList'
import { AddServiceModal } from './components/AddServiceModal'
import { useServices } from './hooks/useServices'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const runningCount = services.filter((s) => s.status === 'running').length
  const stoppedCount = services.filter((s) => s.status === 'stopped').length
  const crashedCount = services.filter((s) => s.status === 'crashed').length

  return (
    <div className="app">
      <Header
        onAddService={() => setIsModalOpen(true)}
        onRefresh={refresh}
        stats={{ running: runningCount, stopped: stoppedCount, crashed: crashedCount }}
      />

      <main className="main-content">
        <ServiceList
          services={services}
          loading={loading}
          onStart={startService}
          onStop={stopService}
          onRestart={restartService}
          onDelete={deleteService}
        />
      </main>

      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addService}
      />

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          flex: 1;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  )
}

export default App
