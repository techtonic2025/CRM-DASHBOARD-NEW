import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './pages/Dashboard'
import { Clienti } from './pages/Clienti'
import { DettaglioCliente } from './pages/DettaglioCliente'
import { Pipeline } from './pages/Pipeline'
import { AttivitaPage } from './pages/AttivitaPage'
import { Analytics } from './pages/Analytics'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1A1D21',
            color: '#f1f5f9',
            border: '1px solid #1E2228',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          },
        }}
      />
      <div className="min-h-screen bg-[var(--bg-base)]">
        <Sidebar />
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/analytics"   element={<Analytics />} />
            <Route path="/clienti"     element={<Clienti />} />
            <Route path="/clienti/:id" element={<DettaglioCliente />} />
            <Route path="/pipeline"    element={<Pipeline />} />
            <Route path="/attivita"    element={<AttivitaPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
