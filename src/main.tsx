import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './tabs/Home'
import Media from './tabs/Media'
import Progress from './tabs/Progress'
import Setting from './tabs/Setting'
import Modal from './components/Modal'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/signup'
import ForgotPassword from './auth/ForgotPassword'
// icons
import { FiHome, FiBarChart2, FiSettings } from 'react-icons/fi'
import { FaPlayCircle } from 'react-icons/fa'
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
  const [showReset, setShowReset] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)
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

  // Redirect /reset-password to root and show Reset modal. Also auto-open if returning from a recovery link
  useEffect(() => {
    if (window.location.pathname === '/reset-password') {
      // replace the URL so only http://localhost:5173 is shown
      window.history.replaceState({}, '', '/')
      setShowReset(true)
      return
    }

    const qs = new URLSearchParams(window.location.search)
    const hs = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (qs.get('type') === 'recovery' || hs.get('type') === 'recovery') {
      setShowReset(true)
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
      className="min-h-[100svh] flex flex-col text-white bg-slate-950 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20" style={{ backgroundColor: '#2D7778' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoAlt as string} alt="Ritmo" className="h-8 sm:h-9 w-auto select-none" draggable={false} />
          </div>
          <nav className="hidden sm:flex items-center gap-5">
            {tabs.map((t) => {
              const isActive = active === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    const needsAuth = t.id === 'progress' || t.id === 'setting'
                    if (needsAuth && !isAuthed) {
                      setPendingTab(t.id)
                      setShowLogin(true)
                      return
                    }
                    setActive(t.id)
                  }}
                  className={`relative p-2 rounded-md transition-colors hover:bg-white/5 ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                  aria-label={t.label}
                  title={t.label}
                >
                  {t.id === 'home' && <FiHome className="h-5 w-5" />}
                  {t.id === 'media' && <FaPlayCircle className="h-5 w-5" />}
                  {t.id === 'progress' && <FiBarChart2 className="h-5 w-5" />}
                  {t.id === 'setting' && <FiSettings className="h-5 w-5" />}
                  <span className="sr-only">{t.label}</span>
                  {isActive && (
                    <span className="pointer-events-none absolute -bottom-0.5 left-1/2 h-px w-6 -translate-x-1/2 bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-400" />
                  )}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <button
                onClick={() => setShowLogin(true)}
               className="inline-flex items-center gap-2 rounded bg-[#4FB89F] px-5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#61CCB2]"

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
  <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">{renderContent()}</main>

      {/* Footer */}
      <footer className="mt-0 border-t border-white/10 w-full" style={{ backgroundColor: '#2D7778' }}>
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
  <Modal open={showLogin} onClose={() => setShowLogin(false)} title="Sign in to Ritmo" logoSrc={logoImg} bgSrc={bgImage}>
        <LoginForm onSuccess={() => {
          setShowLogin(false)
          if (pendingTab) {
            setActive(pendingTab)
            setPendingTab(null)
          }
        }} onShowSignup={() => { setShowLogin(false); setShowSignup(true) }} onShowReset={() => { setShowLogin(false); setShowReset(true) }} />
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
          <button
            type="button"
            onClick={() => {
              setShowLogin(false)
              setShowReset(true)
            }}
            className="text-indigo-500 hover:text-indigo-400"
          >
            Forgot password?
          </button>
        </div>
      </Modal>

          {/* Signup Modal */}
          <Modal
            open={showSignup}
            onClose={() => setShowSignup(false)}
            title="Create your account"
            logoSrc={logoImg}
            bgSrc={bgImage}
            onBack={() => { setShowSignup(false); setShowLogin(true) }}
          >
            <SignupForm
              onSuccess={() => setShowSignup(false)}
              onBackToLogin={() => { setShowSignup(false); setShowLogin(true) }}
            />
          </Modal>

          {/* Reset/Forgot Password Modal */}
          <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Password" logoSrc={logoImg} bgSrc={bgImage}>
            <ForgotPassword
              onBackToLogin={() => {
                setShowReset(false)
                setShowLogin(true)
              }}
            />
          </Modal>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
