import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SolanaProvider } from './providers/SolanaProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <SolanaProvider>
    <StrictMode>
      <BrowserRouter>
          <App />
      </BrowserRouter>
    </StrictMode>
  </SolanaProvider>
)
