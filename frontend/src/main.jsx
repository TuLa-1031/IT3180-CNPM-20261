import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

// HashRouter dùng hash cho route; link ngoài dạng /register vẫn mở được trang đăng ký.
if (window.location.pathname.replace(/\/+$/, '') === '/register' && !window.location.hash) {
  window.history.replaceState(null, '', '/#/register')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
