
import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './tabs/Home'
import Media from './tabs/Media'
import Progress from './tabs/progress'
import Setting from './tabs/Setting'
import Modal from './components/Modal'
import GreetingOverlay from './components/GreetingOverlay'
import LoginForm from './auth/LoginForm'
import SignupForm from './auth/Signup'
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
  // Child name capture & display
  const [userId, setUserId] = useState<string | null>(null)
  const [childName, setChildName] = useState<string>('')
  const [showChildName, setShowChildName] = useState(false)
  const [childNameDraft, setChildNameDraft] = useState('')
  const [showGreeting, setShowGreeting] = useState(false)
  const [hasGreetedLogin, setHasGreetedLogin] = useState(false)

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
        } else if (!hasGreetedLogin) {
          console.debug('[greet] loadChildName -> nickname found, greeting now')
          // If a nickname exists and we haven't greeted yet this login, greet now
          setShowGreeting(true)
          setHasGreetedLogin(true)
        }
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
        // Show greeting once per login/initial load if a name exists in metadata
        if (!hasGreetedLogin) {
          supabase.auth.getUser().then((res: any) => {
            const data = res?.data
            const nickname = (data?.user?.user_metadata as any)?.child_name || ''
            if (nickname.trim()) {
              console.debug('[greet] initial session -> nickname found, greeting now')
              // ensure state is in sync and greet
              setChildName(nickname)
              setChildNameDraft(nickname)
              setShowGreeting(true)
              setHasGreetedLogin(true)
            } else {
              console.debug('[greet] initial session -> no nickname yet')
            }
          }).catch(() => {})
        }
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
          if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && !hasGreetedLogin) {
            supabase.auth.getUser().then((res: any) => {
              const data = res?.data
              const nickname = (data?.user?.user_metadata as any)?.child_name || ''
              if (nickname.trim()) {
                console.debug('[greet] auth event ->', event, 'nickname found, greeting now')
                setChildName(nickname)
                setChildNameDraft(nickname)
                setShowGreeting(true)
                setHasGreetedLogin(true)
              } else {
                console.debug('[greet] auth event ->', event, 'no nickname yet')
              }
            }).catch(() => {})
          }
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
      console.debug('[auth] signed out, reset greet flag')
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
          <div className="flex items-center gap-3">
            {import.meta.env.DEV ? (
              <button
                onClick={() => setShowGreeting(true)}
                className="hidden sm:inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-xs font-medium hover:bg-white/5"
                title="Open Greeting (dev)"
              >
                Test Greeting
              </button>
            ) : null}
            {isAuthed && childName ? (
              <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm">
                <span className="opacity-80">Child:</span>
                <span className="font-semibold">{childName}</span>
              </div>
            ) : null}
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
          <GreetingOverlay open={showGreeting} name={childName} onClose={() => setShowGreeting(false)} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
