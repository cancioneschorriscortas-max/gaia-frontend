import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { UserProvider }  from './contexts/UserContext'
import { MapaProvider }  from './contexts/MapaContext'
import { UIProvider }    from './contexts/UIContext'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <UserProvider>
      <MapaProvider>
        <UIProvider>
          <App />
        </UIProvider>
      </MapaProvider>
    </UserProvider>
  </React.StrictMode>
)