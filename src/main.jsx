import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// A lazy-loaded chunk (e.g. a route's code-split bundle) can 404 if the
// browser still has an older page open after a new deploy replaced it with
// a differently-hashed file. Vite fires this event in that case — reload
// once to pick up the current build instead of showing a broken import error.
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
