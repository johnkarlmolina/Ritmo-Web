import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// @ts-ignore
import { supabase } from './supabaseClient'
import Login from './auth/login'
import Home from './tabs/home'

const App: React.FC = () => {
  const [signedIn, setSignedIn] = useState<boolean>(false)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSignedIn(!!data.session)
      } catch (err) {
        console.warn('Error checking session', err)
      }
    })()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setSignedIn(!!session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (signedIn) return <Home />
  return <Login onSuccess={() => setSignedIn(true)} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
