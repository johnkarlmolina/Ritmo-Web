
import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './tabs/home'
import Landingpage from './tabs/Landingpage'
import Media from './tabs/media'
import Progress from './tabs/progress'
import Setting from './tabs/setting'
import Modal from './components/Modal'
import GreetingOverlay from './components/GreetingOverlay'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/Signup'
import ForgotPassword from './auth/ForgotPassword'
// icons
import { FiHome, FiBarChart2, FiSettings, FiMenu, FiX } from 'react-icons/fi'
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
  const [active, setActive] = useState<string>('landing')
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(false)
  // Child name capture & display
  const [userId, setUserId] = useState<string | null>(null)
  const [childName, setChildName] = useState<string>('')
  const [showChildName, setShowChildName] = useState(false)
  const [childNameDraft, setChildNameDraft] = useState('')
  const [showGreeting, setShowGreeting] = useState(false)
  const [hasGreetedLogin, setHasGreetedLogin] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [hasLeftHome, setHasLeftHome] = useState(false)
  const [isWelcomeBackGreeting, setIsWelcomeBackGreeting] = useState(false)

  const loadChildName = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const meta = (user.user_metadata ?? {}) as any
        const nickname = meta?.child_name ?? ''
        setChildName(nickname)
        setChildNameDraft(nickname)
        if (!nickname) {
          setShowChildName(true)
        }
        // No greeting on initial load - only when returning to home tab
      }
    } catch (e) {
      console.error('Error loading child name:', e)
    }
  }

  useEffect(() => {
    // Initialize current session state
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session
      setIsAuthed(!!session)
      const uid = session?.user?.id ?? null
      setUserId(uid)
      if (uid) {
        loadChildName()
        // No greeting on initial page load/refresh
      } else {
        setChildName('')
        setShowChildName(false)
        setChildNameDraft('')
      }
    })
    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      console.debug('[auth] onAuthStateChange', { event, hasSession: !!session })
      setIsAuthed(!!session)
      if (session) {
        setShowLogin(false)
        setShowSignup(false)
        const uid = session?.user?.id ?? null
        setUserId(uid)
        if (uid) {
          loadChildName()
          // Only greet on actual sign-in, not on page refresh (INITIAL_SESSION)
          if (event === 'SIGNED_IN' && !hasGreetedLogin) {
            supabase.auth.getUser().then((res: any) => {
              const data = res?.data
              const nickname = (data?.user?.user_metadata as any)?.child_name || ''
              if (nickname.trim()) {
                console.debug('[greet] SIGNED_IN event -> nickname found, greeting now')
                setChildName(nickname)
                setChildNameDraft(nickname)
                setIsWelcomeBackGreeting(false) // Initial login greeting
                setShowGreeting(true)
                setHasGreetedLogin(true)
              }
            }).catch(() => {})
          }
          // Notify other parts of the app (e.g., Home) that user just signed in
          try {
            window.dispatchEvent(new CustomEvent('ritmo:auth-signed-in'))
          } catch {}
        } else {
          setChildName('')
          setShowChildName(false)
          setChildNameDraft('')
        }
      } else {
        setChildName('')
        setShowChildName(false)
        setChildNameDraft('')
      }
    })
    return () => {
      sub?.subscription?.unsubscribe?.()
    }
  }, [hasGreetedLogin])

  // Listen for app-wide login requests (e.g., when anonymous user hits the 3-routine limit)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      setPendingTab(detail?.pendingTab || 'home')
      setShowLogin(true)
    }
    window.addEventListener('ritmo:request-login', handler as EventListener)
    return () => window.removeEventListener('ritmo:request-login', handler as EventListener)
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
      // Immediately reflect signed-out state in UI even before the auth listener fires
      setIsAuthed(false)
      setUserId(null)
      setChildName('')
      setChildNameDraft('')
      setShowChildName(false)
      setHasGreetedLogin(false)
      setHasLeftHome(false)
      console.debug('[auth] signed out, reset greet flag')
    } catch (e) {
      console.error(e)
    }
  }

  // Handle "Welcome back" greeting when returning to home tab
  useEffect(() => {
    if (active === 'home' && hasLeftHome && isAuthed && childName && !showGreeting) {
      console.debug('[greet] Returning to home tab -> Welcome back!')
      setIsWelcomeBackGreeting(true) // This is a "welcome back" greeting
      setShowGreeting(true)
      setHasLeftHome(false)
    } else if (active !== 'home' && isAuthed) {
      setHasLeftHome(true)
    }
  }, [active, hasLeftHome, isAuthed, childName, showGreeting])

  const renderContent = () => {
    if (active === 'landing') return <Landingpage onGoToWebsite={() => setActive('home')} />
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
  {/* Header always visible (landing included) */}
  <header className="sticky top-0 z-30" style={{ backgroundColor: '#2D7778' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sm:grid sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-2 sm:justify-self-start">
            <img src={logoAlt as string} alt="Ritmo" className="h-8 sm:h-9 w-auto select-none" draggable={false} />
          </div>
          <nav className={`hidden sm:flex items-center gap-5 justify-center sm:justify-self-center ${active === 'landing' ? 'opacity-0 pointer-events-none' : ''}`}>
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
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 ml-auto sm:ml-0 sm:justify-self-end">
            {/* Child name: hide on very small screens, show from sm+ with truncation */}
            {isAuthed && childName ? (
              <div className="hidden sm:flex items-center gap-2 text-white/90 text-xs sm:text-sm min-w-0 max-w-[40vw] sm:max-w-xs">
                <span className="opacity-80 shrink-0">Child:</span>
                <span className="font-semibold truncate" title={childName}>{childName}</span>
              </div>
            ) : null}
            {/* Auth button */}
            {!isAuthed ? (
              <button
                onClick={() => { setShowLogin(true); setShowMobileNav(false) }}
               className="inline-flex items-center gap-2 rounded bg-[#4FB89F] px-3 sm:px-5 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#61CCB2]"
              >
                Log in
              </button>
            ) : (
              <button
                onClick={() => { handleSignOut(); setShowMobileNav(false) }}
                className="inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium hover:bg-white/5"
              >
                Sign out
              </button>
            )}
            {/* Mobile menu toggle hidden on landing */}
            {active !== 'landing' && (
              <button
                type="button"
                onClick={() => setShowMobileNav(v => !v)}
                className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-white/15 hover:bg-white/5 text-white"
                aria-label={showMobileNav ? 'Close navigation' : 'Open navigation'}
              >
                {showMobileNav ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>
        {/* Mobile dropdown nav (not shown on landing) */}
        {showMobileNav && active !== 'landing' ? (
          <div className="sm:hidden border-t border-white/10" style={{ backgroundColor: '#2D7778' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-4 gap-2">
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
                        setShowMobileNav(false)
                        return
                      }
                      setActive(t.id)
                      setShowMobileNav(false)
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5'}`}
                    aria-label={t.label}
                    title={t.label}
                  >
                    {t.id === 'home' && <FiHome className="h-5 w-5" />}
                    {t.id === 'media' && <FaPlayCircle className="h-5 w-5" />}
                    {t.id === 'progress' && <FiBarChart2 className="h-5 w-5" />}
                    {t.id === 'setting' && <FiSettings className="h-5 w-5" />}
                    <span className="text-[11px] leading-none">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
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

          {/* Child Name Capture Modal (non-dismissable) */}
          <Modal
            open={showChildName}
            onClose={() => { /* non-dismissable until saved */ }}
            title="Set child's nickname"
            logoSrc={logoImg}
            bgSrc={bgImage}
            closable={false}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const name = childNameDraft.trim()
                if (!name || !userId) return
                try {
                  // Update user metadata with child name
                  const { error } = await supabase.auth.updateUser({
                    data: { child_name: name }
                  })
                  if (error) {
                    console.error('Error updating child name:', error)
                    window.alert('Failed to save nickname. Please try again.')
                    return
                  }
                  setChildName(name)
                  setShowChildName(false)
                  setShowGreeting(true)
                  setHasGreetedLogin(true)
                } catch (err) {
                  console.error('Unexpected error updating child name:', err)
                  window.alert('Failed to save nickname. Please try again.')
                }
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm text-slate-800 mb-2">Set child's nickname</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  type="text"
                  value={childNameDraft}
                  onChange={(e) => setChildNameDraft(e.target.value)}
                  placeholder="Enter child's nickname here"
                  maxLength={40}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-semibold shadow disabled:opacity-60"
                disabled={!userId}
              >
                SAVE
              </button>
            </form>
          </Modal>

          {/* Greeting Overlay */}
          <GreetingOverlay 
            open={showGreeting} 
            name={childName} 
            onClose={() => setShowGreeting(false)} 
            isWelcomeBack={isWelcomeBackGreeting}
          />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
