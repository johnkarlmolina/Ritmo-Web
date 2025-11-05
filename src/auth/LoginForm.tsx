import React, { useState } from 'react'
// @ts-ignore - local JS client without types shipped here
import { supabase } from '../supabaseClient'

export type LoginFormProps = {
  onSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (authError) {
        setError(authError.message)
        return
      }
      onSuccess?.()
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || String(err))
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      await supabase.auth.signInWithOAuth({ provider: 'google' })
    } catch (e: any) {
      setError(e?.message || 'Failed to start Google sign-in')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-800 mb-1">Email:</label>
        <input
          className="w-full px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email here"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-slate-800 mb-1">Password:</label>
        <div className="relative">
          <input
            className="w-full pr-12 px-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password here"
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-2 my-auto h-9 w-9 inline-flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {/* Eye icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
        <div className="mt-1 text-right">
          <a href="/reset-password" className="text-xs text-slate-700 hover:text-slate-900">Forgot Password?</a>
        </div>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-full bg-teal-700 hover:bg-teal-600 text-white font-medium shadow disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <a
          href="/signup"
          className="block w-full text-center py-2.5 px-4 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-white font-medium shadow"
        >
          Sign up
        </a>
      </div>

      <div className="pt-2">
        <div className="text-center text-sm text-slate-700">Or sign in with</div>
        <div className="mt-2 flex items-center justify-center">
          <button
            type="button"
            onClick={signInWithGoogle}
            className="h-10 w-10 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center"
            aria-label="Sign in with Google"
          >
            <span className="text-[18px] font-bold" style={{ color: '#4285F4' }}>G</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        By continuing you agree to our <a className="text-indigo-400" href="#">Terms</a> and <a className="text-indigo-400" href="#">Privacy</a>.
      </p>
    </form>
  )
}

export default LoginForm
