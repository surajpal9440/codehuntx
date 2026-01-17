import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { Provider } from 'react-redux'
import { store } from "./store/store.js";
       // <-- make sure path is correct

import { BrowserRouter } from 'react-router'   // <-- FIXED

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>         {/* <-- REQUIRED FOR REDUX */}
      <BrowserRouter>                {/* <-- Correct package */}
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
)
