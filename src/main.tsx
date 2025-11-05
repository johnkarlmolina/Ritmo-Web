import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './tabs/home'
import Media from './tabs/media'
import Progress from './tabs/progress'
import Setting from './tabs/setting'
import Modal from './components/Modal'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/signup'
// @ts-ignore
import { supabase } from './supabaseClient'
// assets
// @ts-ignore: vite handles asset imports
import bgImage from './assets/Background.png'
// @ts-ignore
import logoImg from './assets/Logo.png'
// @ts-ignore
import logoAlt from './assets/Logo-1.png'

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'media', label: 'Media' },
  { id: 'progress', label: 'Progress' },
  { id: 'setting', label: 'Setting' },
]

const App: React.FC = () => {
  const [active, setActive] = useState<string>('home')
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    // Initialize current session state
    supabase.auth.getSession().then((res: any) => setIsAuthed(!!res?.data?.session))
    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsAuthed(!!session)
      if (session) {
        setShowLogin(false)
        setShowSignup(false)
      }
    })
    return () => {
      sub?.subscription?.unsubscribe?.()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error(e)
    }
  }

  const renderContent = () => {
    switch (active) {
      case 'media':
        return <Media />
      case 'progress':
        return <Progress />
      case 'setting':
        return <Setting />
      case 'home':
      default:
        return <Home />
    }
  }

  return (
    <div
      className="min-h-screen text-white bg-slate-950 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoAlt as string} alt="Ritmo" className="h-8 sm:h-9 w-auto select-none" draggable={false} />
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((t) => {
              const isActive = active === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-white/5 ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {t.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-0.5 h-px bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-400" />
                  )}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <button
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center gap-2 rounded bg-indigo-600 px-5 py-2 text-sm font-medium hover:bg-indigo-500"
              >
                Log in
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/5"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{renderContent()}</main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-white/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© <span>{new Date().getFullYear()}</span> Ritmo. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-white" href="#">Privacy</a>
            <a className="hover:text-white" href="#">Terms</a>
            <a className="hover:text-white" href="#">Support</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
  <Modal open={showLogin} onClose={() => setShowLogin(false)} title="Sign in to Ritmo" logoSrc={logoAlt} bgSrc={bgImage}>
        <LoginForm onSuccess={() => setShowLogin(false)} />
            <div className="mt-4 text-sm text-slate-700 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowLogin(false)
                  setShowSignup(true)
                }}
                className="text-indigo-500 hover:text-indigo-400"
              >
                Create account
              </button>
          <a href="/reset-password" className="text-indigo-400">Forgot password?</a>
        </div>
      </Modal>

          {/* Signup Modal */}
          <Modal open={showSignup} onClose={() => setShowSignup(false)} title="Create your account" logoSrc={logoImg} bgSrc={bgImage}>
            <SignupForm onSuccess={() => setShowSignup(false)} />
          </Modal>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
